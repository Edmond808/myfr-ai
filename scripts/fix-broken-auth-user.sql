-- Fix a broken Supabase auth account that blocks signup/login with
-- "Database error finding user" or "Database error querying schema".
--
-- Run in Supabase Dashboard → SQL Editor. Replace the email below.
-- Safe to run even if no user exists (no-op).

do $$
declare
  v_email text := 'edmond199906@gmail.com';
  v_uid uuid;
begin
  select id into v_uid from auth.users where lower(email) = lower(v_email);

  if v_uid is null then
    raise notice 'No auth.users row for % — nothing to delete.', v_email;
    return;
  end if;

  -- profiles cascades from auth.users, but delete explicitly if FK differs
  delete from public.profiles where id = v_uid;
  delete from auth.identities where user_id = v_uid;
  delete from auth.sessions where user_id = v_uid;
  delete from auth.mfa_factors where user_id = v_uid;
  delete from auth.one_time_tokens where user_id = v_uid;
  delete from auth.users where id = v_uid;

  raise notice 'Deleted broken auth user % (%)', v_email, v_uid;
end $$;
