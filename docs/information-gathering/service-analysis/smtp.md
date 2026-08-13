# SMTP (25, 465, 587)

!!! tip "Start here"
    Enumerate users via VRFY: `smtp-user-enum -M VRFY -U users.txt -t $IP`. If VRFY is disabled, try EXPN or RCPT TO. A valid username list from SMTP is useful for password spraying against SMB, WinRM, and RDP.

---

## Enumeration

```bash
nmap -p 25,465,587 --script smtp-commands,smtp-enum-users,smtp-open-relay $IP
nc -nv $IP 25
```

---

## User Enumeration

```bash
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/top-usernames-shortlist.txt -t $IP
smtp-user-enum -M RCPT -U users.txt -t $IP
```

Via Nmap:

```bash
nmap -p 25 --script smtp-enum-users --script-args smtp-enum-users.methods={VRFY,EXPN,RCPT} $IP
```

---

## Open Relay Check

```bash
nmap -p 25,465,587 --script smtp-open-relay $IP
```

If an open relay is confirmed, send a spoofed email:

```bash
sendemail -f spoofed@$DOMAIN -t victim@$DOMAIN -s $IP:25 -u "Test" -m "Message body"
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt smtp://$IP
```

!!! tip "Real-world"
    SMTP user enumeration is a solid early step. VRFY and EXPN are often left enabled on internal mail servers. An open relay is worth documenting as a finding even if you don't exploit it; it's straightforwardly demonstrable (send a spoofed email) and clients understand the risk immediately.
