# Domain Enumeration

!!! tip "Tip"
    BloodHound + SharpHound is the fastest way to map AD attack paths. Import the ZIP and immediately check "Shortest Paths to Domain Admins" — most HTB AD boxes have a 2-3 hop path obvious in the graph.

---

## Users and Groups

### List All Domain Users

```powershell
net user /domain
```

### Inspect a Specific User

```powershell
net user <username> /domain
```

### List All Domain Groups

```powershell
net group /domain
```

### Inspect Members of a Group

```powershell
net group "Domain Admins" /domain
```

---

## Enumerate SPNs

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

---

## ACL Enumeration

### Enumerate ACLs for a User

```powershell
Get-ObjectAcl -Identity "stephanie"
```

### Convert SIDs to Names

```powershell
Convert-SidToName S-1-5-21-1987370270-658905905-1781884369-1104
```

### Find Users with `GenericAll` Permissions

```powershell
Get-ObjectAcl -Identity "Management Department" | ? {$_.ActiveDirectoryRights -eq "GenericAll"} | select SecurityIdentifier,ActiveDirectoryRights
```

---

## Privileged Group Memberships

```powershell
Get-NetGroup "Domain Admins" | select member
```

Example output:

```
member
------
CN=jen,CN=Users,DC=corp,DC=com
```
