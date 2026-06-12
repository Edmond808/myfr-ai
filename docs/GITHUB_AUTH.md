# GitHub authentication (Edmond808 MacBook)

Rivly git operations use **SSH**, not HTTPS passwords. GitHub accounts signed in via Apple ID have **no account password** for git — credential prompts usually mean a stale `gh` token or an HTTPS remote.

## What was broken (Jun 2026)

| Issue | Detail |
|-------|--------|
| **Stale `gh` OAuth token** | `gh auth status` reported `The token in keyring is invalid`. HTTPS git and Cursor features that rely on `gh auth git-credential` then loop on login prompts. |
| **HTTPS remote / keychain** | System gitconfig sets `credential.helper=osxkeychain`; `~/.gitconfig` also routes `github.com` HTTPS through `gh auth git-credential`. When the token is invalid, both paths fail silently and re-prompt. |
| **Apple sign-in** | No GitHub password to enter — device OAuth (`gh auth refresh`) or SSH keys are required. |
| **Missing standard SSH key** | Only legacy `~/.ssh/808` existed; `~/.ssh/config` pointed at non-existent `id_ed25519` until a new key was generated. |

## Fix applied on this Mac

1. **Generated** `~/.ssh/id_ed25519` (`edmond808@icloud.com`).
2. **Registered** the public key on GitHub as `Edmond MacBook Pro` (`gh ssh-key add` or [github.com/settings/keys](https://github.com/settings/keys)).
3. **Configured** `~/.ssh/config` to use `IdentityFile ~/.ssh/id_ed25519` with `IdentitiesOnly yes`.
4. **Switched** repo remote to SSH: `git@github.com:Edmond808/myfr-ai.git`.
5. **Refreshed** `gh` token via device login (`gh auth refresh -h github.com`).
6. **Confirmed** `gh auth setup-git` credential helpers in `~/.gitconfig`.
7. **Set** `gh config set git_protocol ssh` so CLI defaults match the repo.

## Verify (should all pass without prompts)

```bash
gh auth status
ssh -T git@github.com
GIT_TERMINAL_PROMPT=0 git ls-remote origin
git fetch origin
```

Expected: `Hi Edmond808! You've successfully authenticated...` and `ls-remote` / `fetch` succeed with no password dialog.

## One-time steps if auth breaks again

### Refresh `gh` (HTTPS / Cursor / `gh` CLI)

```bash
gh auth refresh -h github.com
# If scopes are missing (e.g. ssh-key add):
gh auth refresh -h github.com -s admin:public_key
gh auth setup-git
```

When prompted, open `https://github.com/login/device`, enter the one-time code, approve scopes. **No password** — browser OAuth only.

### Regenerate SSH key (only if key is lost)

```bash
ssh-keygen -t ed25519 -C "edmond808@icloud.com" -f ~/.ssh/id_ed25519
gh auth refresh -h github.com -s admin:public_key
gh ssh-key add ~/.ssh/id_ed25519.pub --title "Edmond MacBook Pro"
```

Or paste `cat ~/.ssh/id_ed25519.pub` at [Add SSH key](https://github.com/settings/ssh/new).

### Point repo at SSH

```bash
cd /Users/e808m/myfr.ai
git remote set-url origin git@github.com:Edmond808/myfr-ai.git
```

### `~/.ssh/config` (already on this Mac)

```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  IdentitiesOnly yes
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Repeated credential prompts in Cursor/git | Run `gh auth refresh -h github.com`; confirm `git remote -v` shows `git@github.com:...` not `https://` |
| `The token in keyring is invalid` | `gh auth refresh -h github.com` (device login) |
| `Permission denied (publickey)` | Key missing on GitHub or wrong `IdentityFile` in `~/.ssh/config` |
| `gh ssh-key add` → needs `admin:public_key` | `gh auth refresh -h github.com -s admin:public_key` |
| Apple sign-in / no password | Expected — use device OAuth or SSH, never account password |

## Current config snapshot

- **Remote:** `git@github.com:Edmond808/myfr-ai.git`
- **SSH key:** `~/.ssh/id_ed25519` → GitHub title `Edmond MacBook Pro`
- **Global git user:** `LUNC808` / `edmondjr16@gmail.com` (local repo overrides: `Edmond808` / `edmond808@icloud.com`)
- **Credential helpers:** `osxkeychain` (system) + `gh auth git-credential` for `github.com` HTTPS (in `~/.gitconfig`)
