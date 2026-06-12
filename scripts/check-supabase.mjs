// Usage: npm run check:supabase   (run from repo root after filling .env.local)
// Confirms: env vars present, connection works, tables exist, RPC exists.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch { /* rely on real env */ }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ok = (m) => console.log("  \x1b[32m✓\x1b[0m " + m);
const bad = (m) => console.log("  \x1b[31m✗\x1b[0m " + m);

console.log("\nmyfr.ai — Supabase connection check\n");

if (!url || url.includes("PASTE") || url.includes("your-project")) {
  bad("NEXT_PUBLIC_SUPABASE_URL not set in .env.local");
  process.exit(1);
}
if (!key || key.includes("PASTE") || key.includes("your-anon-key")) {
  bad("NEXT_PUBLIC_SUPABASE_ANON_KEY not set in .env.local");
  process.exit(1);
}
ok("Env vars present");

const sb = createClient(url, key);
const tables = ["profiles", "merchants", "jobs", "quotes", "transactions"];
let fail = false;

for (const t of tables) {
  const { error } = await sb.from(t).select("*", { head: true, count: "exact" });
  // RLS may block rows but the table resolving (no 42P01) means it exists
  if (error && error.code === "42P01") {
    bad(`table "${t}" missing — did you run supabase/00_RUN_THIS_IN_SUPABASE.sql?`);
    fail = true;
  } else {
    ok(`table "${t}" exists`);
  }
}

// Check the accept_quote RPC is installed (expect a controlled error, not "function not found")
const { error: rpcErr } = await sb.rpc("accept_quote", {
  p_job_id: "00000000-0000-0000-0000-000000000000",
  p_quote_id: "00000000-0000-0000-0000-000000000000",
});
if (rpcErr && /could not find|does not exist|42883/i.test(rpcErr.message + (rpcErr.code || ""))) {
  bad("RPC accept_quote missing — run PART 2 of the SQL file");
  fail = true;
} else {
  ok("RPC accept_quote installed");
}

// Check dispatch_job RPC similarly
const { error: dErr } = await sb.rpc("dispatch_job", {
  p_job_id: "00000000-0000-0000-0000-000000000000",
});
if (dErr && /could not find|does not exist|42883/i.test(dErr.message + (dErr.code || ""))) {
  bad("RPC dispatch_job missing — re-run PART 1 of the SQL file");
  fail = true;
} else {
  ok("RPC dispatch_job installed");
}

console.log();
if (fail) {
  console.log("\x1b[31mSome checks failed — see above.\x1b[0m\n");
  process.exit(1);
}
console.log("\x1b[32mAll checks passed. Supabase is wired correctly.\x1b[0m");
console.log("Remaining manual clicks: enable Realtime on 'quotes', enable auth providers.\n");
