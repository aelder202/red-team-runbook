# LDAP (389, 636)

!!! tip "Start here"
    Try anonymous bind first: `ldapsearch -x -H ldap://$DC_IP -b "$BASE_DN"`. If it returns data you have unauthenticated enumeration of the entire directory, usernames, computers, group memberships, sometimes passwords in description fields.

---

## Enumeration

```bash
nmap -p 389,636 --script ldap-rootdse $DC_IP
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
ldapsearch -x -H ldap://$DC_IP -D "$USERNAME@$DOMAIN" -W \
  -b "$BASE_DN" "(&(objectCategory=person)(objectClass=user))" sAMAccountName

# All computers
ldapsearch -x -H ldap://$DC_IP -D "$USERNAME@$DOMAIN" -W \
  -b "$BASE_DN" "(objectClass=computer)" cn

# Admin accounts (adminCount=1)
ldapsearch -x -H ldap://$DC_IP -D "$USERNAME@$DOMAIN" -W \
  -b "$BASE_DN" "(&(objectClass=user)(adminCount=1))" sAMAccountName

# Domain Admins group membership
ldapsearch -x -H ldap://$DC_IP -D "$USERNAME@$DOMAIN" -W \
  -b "$BASE_DN" "(memberOf=CN=Domain Admins,CN=Users,$BASE_DN)" sAMAccountName

# Passwords stored in description fields
ldapsearch -x -H ldap://$DC_IP -D "$USERNAME@$DOMAIN" -W \
  -b "$BASE_DN" "(description=*)" sAMAccountName description
```

---

## CrackMapExec

```bash
nxc ldap $DC_IP -u "$USERNAME" -p "$PASSWORD" --users
nxc ldap $DC_IP -u "$USERNAME" -H "$NTLM_HASH"
```

---

## NTLM Relay to LDAP

When LDAP signing and channel-binding policy permit relay, the default LDAP attack can collect directory information. Disable account and ACL modification for an enumeration-only test:

```bash
impacket-ntlmrelayx -t ldap://$DC_IP --no-da --no-acl
```

The `memberOf` query above returns direct membership only; nested group membership requires recursive matching or a directory-analysis tool. See [Responder](../../tools/responder.md) for relay listener setup and cleanup.
