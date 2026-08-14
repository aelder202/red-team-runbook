# IMAP (143, 993)

!!! tip "Start here"
    Connect and request capabilities: `nc $IP 143`, then send `a1 CAPABILITY`. Check whether the server requires or supports STARTTLS before attempting authentication.

---

## Enumeration

```bash
nmap -p 143,993 --script imap-capabilities $IP
```

---

## Manual Interaction

```bash
nc $IP 143

a1 CAPABILITY
a2 LOGIN USERNAME PASSWORD
a3 LIST "" "*"
a4 SELECT INBOX
a5 FETCH 1 BODY[]
a6 FETCH 1:* FLAGS
```

IMAP requires a unique tag at the start of each command (`a1`, `a2`, and so on). Do not append shell-style comments to protocol commands.

For IMAPS (port 993):
```bash
openssl s_client -connect $IP:993
openssl s_client -connect $IP:143 -starttls imap
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt imap://$IP
```

---

## NTLM Info (Windows environments)

```bash
nmap --script imap-ntlm-info -p 143,993 $IP
```

If NTLM authentication is in use, the response leaks internal hostname, domain, and OS version without any credentials.

`AUTH=PLAIN` or `AUTH=LOGIN` describes an authentication mechanism, not the transport protection. Credentials are exposed only if that mechanism is used before TLS is established; many servers suppress cleartext authentication until after STARTTLS.

---

## What to Look For

Once authenticated, search emails for:

- Plaintext credentials or API keys
- Password reset links for internal services
- Internal hostnames, IP ranges, or infrastructure details
- Attachments containing configuration files
