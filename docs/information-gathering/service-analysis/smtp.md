# SMTP (25, 465, 587)

!!! tip "Start here"
    Enumerate users via VRFY: `smtp-user-enum -M VRFY -U users.txt -t 10.10.10.10`. If VRFY is disabled, try EXPN or RCPT TO. A valid username list from SMTP is useful for password spraying against SMB, WinRM, and RDP.

---

## Enumeration

```bash
nmap -p 25,465,587 --script smtp-commands,smtp-enum-users,smtp-open-relay 10.10.10.10
nc -nv 10.10.10.10 25
```

---

## User Enumeration

```bash
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/top-usernames-shortlist.txt -t 10.10.10.10
smtp-user-enum -M RCPT -U users.txt -t 10.10.10.10
```

Via Nmap:

```bash
nmap -p 25 --script smtp-enum-users --script-args smtp-enum-users.methods={VRFY,EXPN,RCPT} 10.10.10.10
```

---

## Open Relay Check

```bash
nmap -p 25,465,587 --script smtp-open-relay 10.10.10.10
```

If an open relay is confirmed, send a spoofed email:

```bash
sendemail -f spoofed@example.com -t victim@target.com -s 10.10.10.10:25 -u "Test" -m "Message body"
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt smtp://10.10.10.10
```

!!! tip "Real-world"
    SMTP user enumeration is a solid early step — VRFY and EXPN are often left enabled on internal mail servers. An open relay is worth documenting as a finding even if you don't exploit it; it's straightforwardly demonstrable (send a spoofed email) and clients understand the risk immediately.
