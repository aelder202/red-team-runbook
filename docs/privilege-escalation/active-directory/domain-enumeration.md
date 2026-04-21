### References

- [PowerView: PowerShell AD Enumeration](https://github.com/PowerShellMafia/PowerSploit/blob/master/Recon/PowerView.ps1)
    
- [BloodHound: Visualizing Active Directory](https://bloodhound.readthedocs.io/en/latest/)

    

---

## Enumerating Domain Users and Groups

Identifying users and groups within Active Directory helps determine high-value targets.

### Listing All Domain Users

```powershell
net user /domain
```

### Inspecting a Specific User

```powershell
net user <username> /domain
```

### Listing All Domain Groups

```powershell
net group /domain
```

### Inspecting Members of a Specific Group

```powershell
net group "Domain Admins" /domain
```

These commands help identify privileged accounts, potential targets, and misconfigurations.

---

## Enumerating Service Principal Names (SPNs)

SPNs are unique identifiers that map services to specific accounts. They are commonly used in Kerberoasting attacks.

### Listing SPNs for All Users

```powershell
Get-NetUser -SPN | select samaccountname,serviceprincipalname
```

Example output:

```
samaccountname serviceprincipalname
-------------- --------------------
krbtgt         kadmin/changepw
iis_service    {HTTP/web04.corp.com, HTTP/web04, HTTP/web04.corp.com:80}
```

This helps identify service accounts that may have high privileges.

---

## Enumerating Active Directory Permissions and ACLs

### Understanding ACLs

Each AD object has an Access Control List (ACL) that contains Access Control Entries (ACEs). These define whether access to an object is allowed or denied.

Key permissions:

```
GenericAll: Full permissions on object
GenericWrite: Edit certain attributes
WriteOwner: Change ownership
WriteDACL: Modify object permissions
AllExtendedRights: Change password, reset password, etc.
ForceChangePassword: Change another user’s password
Self: Add oneself to a group
```

### Enumerating ACLs for a User

```powershell
Get-ObjectAcl -Identity <username>
```

Example:

```powershell
Get-ObjectAcl -Identity "stephanie"
```

This returns the ACEs applied to the user.

### Converting SIDs to Names

```powershell
Convert-SidToName S-1-5-21-1987370270-658905905-1781884369-1104
```

Example output:

```
CORP\stephanie
```

This helps correlate raw security identifiers (SIDs) to actual usernames.

---

## Identifying Privileged Group Memberships

### Enumerating Domain Admins

```powershell
Get-NetGroup "Domain Admins" | select member
```

Example output:

```
member
------
CN=jen,CN=Users,DC=corp,DC=com
```

If a non-admin account appears in a privileged group, it may indicate a misconfiguration.

---

## Enumerating Object Permissions for Privilege Escalation

Identifying misconfigured ACLs can help escalate privileges within AD.

### Finding Users with `GenericAll` Permissions

```powershell
Get-ObjectAcl -Identity "Management Department" | ? {$_.ActiveDirectoryRights -eq "GenericAll"} | select SecurityIdentifier,ActiveDirectoryRights
```

Example output:

```
SecurityIdentifier                            ActiveDirectoryRights
------------------                            ---------------------
S-1-5-21-1987370270-658905905-1781884369-512  GenericAll
S-1-5-21-1987370270-658905905-1781884369-1104 GenericAll
```

Converting SIDs reveals:

```
PS C:\Tools> Convert-SidToName S-1-5-21-1987370270-658905905-1781884369-1104
CORP\stephanie
```

If `stephanie` has `GenericAll`, it indicates full control over the object, which can be leveraged for privilege escalation.