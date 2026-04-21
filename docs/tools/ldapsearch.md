# LDAPSearch — LDAP Enumeration

!!! tip "Tip"
    Anonymous bind query: `ldapsearch -x -H ldap://10.10.10.10 -b "DC=domain,DC=local" "(objectClass=user)" sAMAccountName`. Pipe to `grep sAMAccountName` for a clean user list. Add `-D "user@domain" -w "pass"` for authenticated queries.

---

## Syntax

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "<user>@<domain>" -w <pass> -b "<baseDN>" <filter> [attributes]
```

- `-x`: Use simple authentication (not SASL)
- `-H`: URI of the LDAP server (e.g., `ldap://10.10.10.10`)
- `-D`: Bind DN (user principal name)
- `-w`: Password
- `-b`: Base DN (Distinguished Name root)
- `<filter>`: LDAP filter (e.g., `(objectClass=user)`)
- `[attributes]`: Specific fields to return

---

## Determine the Base DN

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

### 5. Get Password Policy

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "user@domain.local" -w 'password' -b "DC=domain,DC=local" "(objectClass=domain)" maxPwdAge minPwdLength lockoutThreshold
```

`maxPwdAge` is in 100-nanosecond intervals. To convert to days:

```bash
echo "$(( (-1 * <value>) / 10000000 / 60 / 60 / 24 )) days"
```

---

## Output Parsing

Save results for later parsing:

```bash
ldapsearch ... > ldap_output.txt
```

Extract users quickly:

```bash
grep sAMAccountName ldap_output.txt | cut -d' ' -f2
```

---

## Full Example

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "svc_reader@corp.local" -w 'Summer2023!' -b "DC=corp,DC=local" "(objectClass=user)" sAMAccountName memberOf
```

Dumps all usernames and group memberships the account can see.

---

## Quick Username Extraction Script

```bash
ldapsearch -x -H ldap://10.10.10.10 -D "svc@corp.local" -w 'pass' -b "DC=corp,DC=local" "(objectClass=user)" sAMAccountName \
    | grep "^sAMAccountName" | cut -d' ' -f2 > usernames.txt
```
