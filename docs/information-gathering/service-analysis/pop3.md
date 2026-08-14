# POP3 (110, 995)

!!! tip "Start here"
    Connect with `nc $IP 110` and send `CAPA` before authenticating. If `STLS` is available, establish TLS rather than sending approved credentials over cleartext POP3.

---

## Enumeration

```bash
nmap -p 110,995 --script pop3-capabilities $IP
```

---

## Manual Interaction

```bash
nc $IP 110

USER admin
PASS password
LIST
RETR 1
QUIT
```

`LIST` returns message numbers and sizes; `RETR 1` retrieves message 1. Do not append shell-style comments to protocol commands.

For POP3S (port 995):

```bash
openssl s_client -connect $IP:995
openssl s_client -connect $IP:110 -starttls pop3
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt pop3://$IP
hydra -L users.txt -P passwords.txt pop3s://$IP
```

---

## Cleartext Auth Check

Check capabilities without submitting credentials:

```bash
printf 'CAPA\r\nQUIT\r\n' | nc -nv $IP 110
```

If `STLS` is absent and the service accepts `USER`/`PASS`, authentication traffic is unencrypted. When `STLS` is present, inspect the protected session separately with `openssl s_client -connect $IP:110 -starttls pop3`.
