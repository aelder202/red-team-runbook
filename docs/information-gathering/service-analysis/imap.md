```table-of-contents
```
**Internet Message Access Protocol (IMAP)** is an email retrieval protocol that allows users to manage emails on a remote mail server. IMAP operates on **TCP port 143 (plaintext)** and **TCP port 993 (IMAPS - SSL encrypted)**.

Attackers target IMAP for **credential brute-forcing, email data extraction, authentication bypass, and lateral movement**. If a user reuses passwords, compromising an IMAP account may grant access to **corporate infrastructure** or **other services**.

### **Common Attack Vectors:**

- **Banner Grabbing & Version Identification** – Identifies IMAP server versions and vulnerabilities.
- **Brute-Forcing IMAP Credentials** – Exploiting weak or reused passwords.
- **Plaintext Authentication Exposure** – Some IMAP servers allow **insecure authentication**, enabling credential interception.
- **Email Data Extraction** – Gaining access to stored emails, potentially revealing sensitive information.
- **Lateral Movement** – Using email accounts to **reset passwords, hijack communications, or escalate privileges**.

**Bookmarks:**
NTLM Relay Attacks: [Impacket NTLMRelayX](https://github.com/fortra/impacket/blob/master/examples/ntlmrelayx.py)
## Enumeration
### Banner Grabbing
```bash
nmap -p 143,993 --script imap-capabilities,imap-ntlm-info <target-ip>
```

## User Enumeration
```bash
nmap --script imap-brute -p 143 <target-ip>
```

## Authentication Attacks
### Brute-Forcing Creds
```bash
hydra -L users.txt -P passwords.txt imap://<target-ip> -V
```

Metasploit:
```bash
msfconsole
use auxiliary/scanner/imap/imap_login
set RHOSTS <target-ip>
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```
## Insecure Authentication
IMAP servers may allow **plaintext authentication**, making them vulnerable to **Man-in-the-Middle (MITM) attacks**.
```bash
openssl s_client -connect <target-ip>:143 -starttls imap
```

If `AUTH PLAIN` or `AUTH LOGIN` is returned, **plaintext authentication is enabled**, making it possible to intercept credentials.
## Exploiting IMAP Misconfigurations
### Weak or Default Credentials
Login using known/weak credentials to access sensitive email data, including potentially sensitive information (password resets, confidential data, etc.).
```bash
nc -nv <target-ip> 143
```

#### Check available mailboxes:
```nginx
a LIST "" "*"
```

#### Select mailbox
```css
a SELECT INBOX
```

#### Read email messages
```css
a FETCH 1 BODY[]
```

### Email Data Leakage
Review retrieved emails for sensitive data, credentials, internal information, or information useful for privilege escalation and lateral movement.

### NTLM Authentication (Windows environments)
If NTLM authentication is used, it may allow NTLM relay or Pass-the-Hash attacks.

Enumerate NTLM information:
```bash
nmap --script imap-ntlm-info -p 143,993 <target-ip>
```

Relay NTLM authentication using `responder` and `ntlmrelayx` (advanced technique if IMAP clients attempt NTLM auth):
```bash
responder -I eth0 -rdwv
```

## Post-Exploitation & Lateral Movement

Once IMAP credentials are compromised:

1. **Attempt SMTP Authentication (Port 25/465/587)** – If SMTP authentication is allowed, send **emails as the victim**.
2. **Use IMAP Access to Hijack Accounts** – If MFA is disabled, **reset passwords for internal services**.
3. **Check for Stored Credentials in Emails** – Extract login details, API keys, or private information.
4. **Pivot to Internal Services** – If the compromised user has **IT privileges**, leverage email access for internal enumeration.