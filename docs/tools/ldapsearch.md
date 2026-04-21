# LDAPSearch — Lightweight Directory Access Protocol Enumeration

## Overview

`ldapsearch` is a command-line utility from the **OpenLDAP suite** used to query LDAP directories. It can be used for **enumerating domain users, groups, computers, policies, and attributes** from an Active Directory Domain Controller when TCP port **389 (LDAP)** is open.

It is useful when:

- You have valid domain credentials
    
- You want to perform stealthy AD enumeration without using high-noise tools
    
- You want structured, attribute-level recon
    
- You’re pivoted inside and need to enumerate without GUI tools like RSAT or BloodHound
    

---

## Syntax

```bash
ldapsearch -x -H ldap://<ip> -D "<user>@<domain>" -w <password> -b "<baseDN>" <filter> [attributes]
```

- `-x`: Use simple authentication (not SASL)
    
- `-H`: URI of the LDAP server (e.g., `ldap://10.10.10.10`)
    
- `-D`: Bind DN (user principal name)
    
- `-w`: Password
    
- `-b`: Base DN (Distinguished Name root)
    
- `<filter>`: LDAP filter (e.g., `(objectClass=user)`)
    
- `[attributes]`: Specific fields to return
    

---

## Determine the Base DN (Optional)

Use this if you’re unsure of the BaseDN:

```bash
ldapsearch -x -H ldap://10.10.10.10 -s base namingcontexts
```

Output:

```
dn:
namingContexts: DC=domain,DC=local
```

Use this result in the `-b` flag.

---

## Common Enumeration Queries

### 1. Enumerate All Domain Users

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "user@domain.local" -w 'password' -b "DC=domain,DC=local" "(objectClass=user)" sAMAccountName
```

### 2. Enumerate All Groups

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "user@domain.local" -w 'password' -b "DC=domain,DC=local" "(objectClass=group)" sAMAccountName
```

### 3. Get Group Membership of Specific User

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "user@domain.local" -w 'password' -b "DC=domain,DC=local" "(&(objectClass=user)(sAMAccountName=targetuser))" memberOf
```

### 4. Enumerate Domain Computers

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "user@domain.local" -w 'password' -b "DC=domain,DC=local" "(objectClass=computer)" dNSHostName
```

### 5. Get Password Policy (If Exposed)

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "user@domain.local" -w 'password' -b "DC=domain,DC=local" "(objectClass=domain)" maxPwdAge minPwdLength lockoutThreshold
```

Note: `maxPwdAge` is in 100-nanosecond intervals. To convert to days:

```bash
echo "$(( (-1 * <value>) / 10000000 / 60 / 60 / 24 )) days"
```

---

## Output Parsing Tips

You can save results for later parsing:

```bash
ldapsearch ... > ldap_output.txt
```

Then extract users quickly:

```bash
grep sAMAccountName ldap_output.txt | cut -d' ' -f2
```

---

## Example: Full Command in Practice

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "svc_reader@corp.local" -w 'Summer2023!' -b "DC=corp,DC=local" "(objectClass=user)" sAMAccountName memberOf
```

This dumps all usernames and group memberships the account can see.

---

## Summary: ldapsearch Usage

|Task|Command (example)|
|---|---|
|Find Base DN|`ldapsearch -x -H ldap://<ip> -s base namingcontexts`|
|List domain users|`ldapsearch ... "(objectClass=user)" sAMAccountName`|
|List domain groups|`ldapsearch ... "(objectClass=group)" sAMAccountName`|
|Group membership of user|`ldapsearch ... "(sAMAccountName=username)" memberOf`|
|List domain computers|`ldapsearch ... "(objectClass=computer)" dNSHostName`|
|Dump password policy|`ldapsearch ... "(objectClass=domain)" maxPwdAge ...`|

---

## Notes

- You must have **bind credentials** (username/password) unless anonymous LDAP binds are allowed (rare in modern AD)
    
- `ldapsearch` is very **OPSEC-safe** compared to executing RPC or SMB scans
    
- Use `-LLL` for cleaner output formatting
    
- Combine with `cut`, `grep`, `awk` for automation/scripting
    

---

## Quick Username Extraction Script

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "svc@corp.local" -w 'pass' -b "DC=corp,DC=local" "(objectClass=user)" sAMAccountName \
    | grep "^sAMAccountName" | cut -d' ' -f2 > usernames.txt
```
