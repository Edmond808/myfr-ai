# GitHub authentication (Edmond808)

Rivly uses **SSH** for git push/fetch. Apple ID sign-in accounts do not use a GitHub password for git operations.

## Quick setup

1. Generate a key (if needed):

   ```bash
   ssh-keygen -t ed25519 -C "your@email.com" -f ~/.ssh/id_ed25519
   ```

2. Add the public key to GitHub — either CLI or browser:

   **CLI** (requires `gh` logged in with `admin:public_key` scope):

   ```bash
   gh auth refresh -h github.com -s admin:public_key
   gh ssh-key add ~/.ssh/id_ed25519.pub --title "Edmond MacBook Pro"
   ```

   **Browser** (works without `gh` token scopes):

   - Open [Add SSH key](https://github.com/settings/ssh/new)
   - Title: `Edmond MacBook Pro`
   - Paste the output of `cat ~/.ssh/id_ed25519.pub`
   - Save

3. Point the repo at SSH (already set for this project):

   ```bash
   git remote set-url origin git@github.com:Edmond808/myfr-ai.git
   ```

4. Optional `~/.ssh/config` entry (uses the Ed25519 key for GitHub):

   ```
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_ed25519
     IdentitiesOnly yes
   ```

5. Verify:

   ```bash
   ssh -T git@github.com
   git fetch origin
   ```

   Success looks like: `Hi Edmond808! You've successfully authenticated...`

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `gh ssh-key add` → HTTP 404 / needs `admin:public_key` | Run `gh auth refresh -h github.com -s admin:public_key`, or upload the key manually at [github.com/settings/ssh/new](https://github.com/settings/ssh/new) |
| `Permission denied (publickey)` | Key not on GitHub yet, or wrong key in `IdentityFile` |
| `The token in keyring is invalid` | `gh auth refresh -h github.com` (complete browser/device login) |
| Apple sign-in / no password | Normal — use SSH keys or `gh auth login`, not account password for git |

## `gh` device login

If `gh auth refresh` prints a one-time code, open the URL it shows (usually `https://github.com/login/device`), enter the code, and approve the requested scopes. Then retry `gh ssh-key add` or use the manual upload URL above.
