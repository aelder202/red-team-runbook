**Simple Network Management Protocol (SNMP)** is a network protocol used for managing and monitoring network devices such as **routers, switches, printers, and servers**. SNMP operates on **UDP port 161** (queries) and **UDP port 162** (traps/alerts).

Attackers target **SNMP misconfigurations** to extract **network information, user credentials, and device configurations**. If write access is enabled, **remote code execution** or **network disruption** is possible.

## Common Attack Vectors

- **SNMP Community String Enumeration** – Many SNMP services use **default or weak community strings** (`public`, `private`).
- **Extracting Device & User Information** – Attackers can retrieve **system details, network configurations, and running services**.
- **SNMP Write Access Exploitation** – If `SET` requests are allowed, an attacker can modify configurations or execute commands.
- **Network Reconnaissance & Lateral Movement** – SNMP can reveal **network topology, users, and access control lists (ACLs)**.

**Bookmarks:**
SNMPwalk Documentation: https://linux.die.net/man/1/snmpwalk
SNMP Enumeration Guide: https://book.hacktricks.xyz/network-services-pentesting/pentesting-snmp
onesixtyone GitHub: [https://github.com/trailofbits/onesixtyone](https://github.com/trailofbits/onesixtyone)
snmp-check GitHub: [https://github.com/hatlord/snmp-check](https://github.com/hatlord/snmp-check)

SambaCry (CVE-2017-7494):
https://github.com/00mjk/exploit-CVE-2017-7494
https://github.com/opsxcq/exploit-CVE-2017-7494
## Enumeration
### Check for Open SNMP Ports
```bash
sudo nmap -sU -p161 --script="*snmp*" $IP
```

Reference any services, or other valuable information returned from the above scan, with searchsploit to identify potential attack vectors.
## String Enumeration
```bash
nmap -sU -p 161 --script=snmp-brute $IP
```

## SNMP Enumeration w/ valid Community String
### What is an SNMP Community String?

An **SNMP community string** acts as a password that controls access to SNMP-enabled network devices. There are typically two types of community strings:

- **Read-only (`public`)**: Commonly used default, allowing viewing (enumerating) of device configurations and status.
- **Read-write (`private`)**: Allows viewing and modifying device configurations.

Misconfigured or default community strings are commonly found, providing attackers with substantial device information or control.

### How to Find SNMP Community Strings

Enumerating community strings usually involves brute-forcing default or common values.
```bash
nmap -sU -p 161 --script=snmp-brute $IP
```

### Enumerating SNMP Information
```bash
snmpwalk -c public -v1 $IP
```

* This assumes the `public` community string is valid

## Retrieving System & User Information
```bash
snmpwalk -c public -v1 $IP 1.3.6.1.2.1.1
```

- `1.3.6.1.2.1.1` → **General system information**.

Extracting User Accounts:
```bash
snmpwalk -c public -v1 $IP 1.3.6.1.4.1.77.1.2.25
```

List Running Processes:
```bash
snmpwalk -c public -v1 $IP 1.3.6.1.2.1.25.4.2.1.2
```

Extract Installed Software:
```bash
snmpwalk -c public -v1 $IP 1.3.6.1.2.1.25.6.3.1.2
```

## Post-Exploitation & Lateral Movement
Identify Administrator workstations:
```bash
snmpwalk -c public -v1 $IP 1.3.6.1.2.1.25.1.6
```

**Check for open services** (useful for **brute-force attacks**):
```bash
snmpwalk -c public -v1 $IP 1.3.6.1.2.1.6.13.1.3
```