# POP3 (110, 995)

!!! tip "Start here"
    Connect directly and authenticate: `nc 10.10.10.10 110`, then `USER <username>` / `PASS <password>`. Once in, `LIST` shows available messages and `RETR 1` downloads the first one. Same credentials often work on IMAP, SMTP, and other internal services.

---

## Enumeration

```bash
nmap -p 110,995 --script pop3-capabilities 10.10.10.10
```

---

## Manual Interaction

```bash
nc 10.10.10.10 110

USER admin
PASS password
LIST            # list messages
RETR 1          # read message 1
QUIT
```

For POP3S (port 995):

```bash
openssl s_client -connect 10.10.10.10:995
openssl s_client -connect 10.10.10.10:110 -starttls pop3
```

---

## Brute Force

```bash
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt pop3://10.10.10.10
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt -s 995 pop3s://10.10.10.10
```

---

## Cleartext Auth Check

If port 110 is open without TLS, credentials are sent in cleartext. Check what auth methods are advertised:

```bash
openssl s_client -connect 10.10.10.10:110 -starttls pop3
```

Look for `AUTH PLAIN` or `AUTH LOGIN` in the capability response — if present on an unencrypted connection, credentials are interceptable.

!!! tip "Real-world"
    POP3 is low priority compared to IMAP — it downloads and deletes messages rather than leaving them server-side, so you get less visibility. That said, compromised POP3 credentials are worth testing across SMB, WinRM, and VPN immediately. IT staff email is often a goldmine for internal hostnames and credentials in forwarded threads.
