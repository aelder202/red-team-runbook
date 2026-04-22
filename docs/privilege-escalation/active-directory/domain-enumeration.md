# Domain Enumeration

!!! tip "Tip"
    BloodHound collection first, analysis second. Throw the ZIP into BloodHound and run "Shortest Paths to Domain Admins" before spending time on manual enumeration — the graph almost always surfaces the path faster.

!!! warning "Watch out"
    SharpHound / bloodhound-python generates LDAP queries from every collector, SMB connections from SessionEnum, and SPN scans from ComputerOnly collectors. On monitored environments, pick your method (`-CollectionMethod DCOnly`, `--auth-method ntlm`) carefully.

---

## BloodHound Collection

### From Linux (`bloodhound-python`)

```bash
bloodhound-python -c all -d example.com -u <user> -p '<pass>' -ns 10.10.10.10 --zip
```

Noise-reduced (LDAP only, no sessionenum):

```bash
bloodhound-python -c DCOnly -d example.com -u <user> -p '<pass>' -ns 10.10.10.10 --zip
```

### From Windows (SharpHound)

```powershell
.\SharpHound.exe -c All --zipfilename collection.zip
.\SharpHound.exe -c DCOnly --zipfilename dc-only.zip      # quietest
.\SharpHound.exe -c Session --loop --loopduration 02:00    # session data over 2h
```

### From Linux with `nxc`

```bash
nxc ldap 10.10.10.10 -u <user> -p '<pass>' --bloodhound --collection All --dns-server 10.10.10.10
```

---

## LDAP Enumeration (No PowerShell Required)

### ldapsearch — anonymous bind check

```bash
ldapsearch -x -H ldap://10.10.10.10 -b "DC=example,DC=com" -s base
```

### Authenticated queries

```bash
# All domain users
ldapsearch -x -H ldap://10.10.10.10 -D '<user>@example.com' -w '<pass>' -b "DC=example,DC=com" "(objectClass=user)" samaccountname

# Users with SPNs (kerberoastable)
ldapsearch -x -H ldap://10.10.10.10 -D '<user>@example.com' -w '<pass>' -b "DC=example,DC=com" "(&(objectClass=user)(servicePrincipalName=*))" samaccountname servicePrincipalName

# Users without Kerberos pre-auth (ASREP-roastable)
ldapsearch -x -H ldap://10.10.10.10 -D '<user>@example.com' -w '<pass>' -b "DC=example,DC=com" "(&(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=4194304))" samaccountname

# Domain Admins
ldapsearch -x -H ldap://10.10.10.10 -D '<user>@example.com' -w '<pass>' -b "DC=example,DC=com" "(memberOf=CN=Domain Admins,CN=Users,DC=example,DC=com)" samaccountname

# Password policy
ldapsearch -x -H ldap://10.10.10.10 -D '<user>@example.com' -w '<pass>' -b "DC=example,DC=com" -s base "(objectClass=*)" minPwdLength lockoutThreshold
```

### nxc (quick AD overview)

```bash
nxc smb 10.10.10.10 -u <user> -p '<pass>' --users
nxc smb 10.10.10.10 -u <user> -p '<pass>' --groups
nxc smb 10.10.10.10 -u <user> -p '<pass>' --pass-pol
nxc smb 10.10.10.10 -u <user> -p '<pass>' --loggedon-users
nxc smb 10.10.10.10 -u <user> -p '<pass>' --shares
```

---

## PowerView (From a Domain-Joined Shell)

PowerView's dev branch uses the `Get-Domain*` naming. Stock PowerSploit (older) uses `Get-Net*` — both appear in the wild, but the dev branch is current.

```powershell
Import-Module .\PowerView.ps1

# Users
Get-DomainUser | Select samaccountname,description,memberof
Get-DomainUser -SPN                                          # kerberoastable
Get-DomainUser -PreauthNotRequired                            # ASREP-roastable
Get-DomainUser -AdminCount                                    # admin-flagged accounts

# Groups
Get-DomainGroup | Where-Object { $_.adminCount -eq 1 }
Get-DomainGroupMember "Domain Admins" -Recurse
Get-DomainGroupMember "Enterprise Admins" -Recurse

# Computers
Get-DomainComputer | Select dnshostname,operatingsystem,operatingsystemversion

# GPOs
Get-DomainGPO
Get-DomainGPOUserLocalGroupMapping                           # where does GPO grant local admin?

# Trusts
Get-DomainTrust
Get-ForestTrust

# Current user's effective AD rights
Get-DomainUser -Identity $env:USERNAME -Properties memberof
```

---

## Key Targets for the First Pass

| Target | Why it matters | Query |
|---|---|---|
| krbtgt | Golden ticket target | `Get-DomainUser krbtgt` |
| Users with SPNs | Kerberoasting | `Get-DomainUser -SPN` |
| Users without pre-auth | ASREP-roasting | `Get-DomainUser -PreauthNotRequired` |
| adminCount=1 accounts | Protected-from-ACL-reset list | `Get-DomainUser -AdminCount` |
| AS-REP disabled + admin | Highest value | Combine above |
| Unconstrained delegation | Coerce + dump TGT | `Get-DomainComputer -Unconstrained` |
| Constrained delegation | S4U2Self/S4U2Proxy | `Get-DomainUser -TrustedToAuth` |
| ms-DS-MachineAccountQuota | Can you join machines? | `(Get-DomainObject -Identity "DC=example,DC=com").'ms-DS-MachineAccountQuota'` |

---

## Trusts and Cross-Domain Enumeration

```powershell
Get-DomainTrust
Get-DomainTrustMapping          # walks the trust graph recursively
Get-ForestTrust
```

From Linux:

```bash
nxc smb 10.10.10.10 -u <user> -p '<pass>' -M enum_trusts
```

Any bidirectional trust or "Forest" trust is worth mapping in BloodHound — misconfigurations in parent/child trusts frequently let a child DA hop to the forest root.
