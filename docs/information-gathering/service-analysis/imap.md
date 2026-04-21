# IMAP (143, 993)

!!! tip "Start here"
    Connect directly and check capabilities: `nc 10.10.10.10 143`, then send `a1 CAPABILITY`. Look for `AUTH=PLAIN` or `AUTH=LOGIN` on port 143 — if present, credentials are in cleartext. Worth a quick brute force with a default credentials list before going to rockyou.

---

## Enumeration

```bash
nmap -p 143,993 --script imap-capabilities,imap-ntlm-info 10.10.10.10
```

---

## Manual Interaction

```bash
nc 10.10.10.10 143

# Once connected:
a1 CAPABILITY              # check supported auth methods
a1 LOGIN <user> <pass>     # authenticate
a1 LIST "" "*"             # list all mailboxes
a1 SELECT INBOX            # select a mailbox
a1 FETCH 1 BODY[]          # read first email
a1 FETCH 1:* FLAGS         # list all messages with flags
```

For IMAPS (port 993):
```bash
openssl s_client -connect 10.10.10.10:993
openssl s_client -connect 10.10.10.10:143 -starttls imap
```

---

## Brute Force

```bash
hydra -L users.txt -P /usr/share/seclists/Passwords/Default-Credentials/default-userpasscombo.txt imap://10.10.10.10
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt imap://10.10.10.10
```

---

## NTLM Info (Windows environments)

```bash
nmap --script imap-ntlm-info -p 143,993 10.10.10.10
```

If NTLM authentication is in use, the response leaks internal hostname, domain, and OS version without any credentials.

---

## What to Look For

Once authenticated, search emails for:

- Plaintext credentials or API keys
- Password reset links for internal services
- Internal hostnames, IP ranges, or infrastructure details
- Attachments containing configuration files

!!! tip "Real-world"
    IMAP access on a compromised account is often more valuable than it looks. IT staff and developers frequently have credentials, VPN configs, or MFA backup codes sitting in their inbox. Always check sent items and drafts too — not just the inbox.
