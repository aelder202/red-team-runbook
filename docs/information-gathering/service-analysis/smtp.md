# SMTP (25, 465, 587)

!!! tip "Start here"
    Enumerate users via VRFY: `smtp-user-enum -M VRFY -U users.txt -t $IP`. If VRFY is disabled, try EXPN or RCPT TO. A valid username list from SMTP is useful for password spraying against SMB, WinRM, and RDP.

---

## Enumeration

```bash
nmap -p 25,465,587 --script smtp-commands $IP
nc -nv $IP 25
openssl s_client -connect $IP:587 -starttls smtp
openssl s_client -connect $IP:465
```

---

## User Enumeration

```bash
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/top-usernames-shortlist.txt -t $IP
smtp-user-enum -M RCPT -U users.txt -D $DOMAIN -t $IP
```

Via Nmap:

```bash
nmap -p 25 --script smtp-enum-users --script-args 'smtp-enum-users.methods={VRFY,EXPN,RCPT}' $IP
```

User enumeration scripts issue repeated `VRFY`, `EXPN`, or `RCPT TO` requests and are classified as intrusive. Use a scoped user list and stop if the server begins throttling.

---

## Open Relay Check

```bash
nmap -p 25,465,587 --script smtp-open-relay $IP
```

Validate relay acceptance without sending a message body:

```bash
swaks --server $IP --from tester@external.example --to recipient@external.example --quit-after RCPT
```

A `250` response to the external recipient is evidence of relay acceptance. Do not proceed to `DATA` unless delivery is explicitly required and approved.

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt smtp://$IP
```
