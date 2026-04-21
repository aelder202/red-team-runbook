# SNMP (161, 162)

!!! tip "Start here"
    Default community string is `public`. Try: `snmpwalk -v2c -c public 10.10.10.10`. If it returns data, enumerate further with `snmp-check 10.10.10.10` for users, running processes, and installed software. SNMPv1/v2c sends community strings in cleartext — capture it from the wire if you can.

!!! warning "Watch out"
    SNMPv3 requires credentials and brute forcing is slow. SNMPv1/v2c is the target.

---

## Enumeration

```bash
sudo nmap -sU -p 161 --script "snmp-*" 10.10.10.10
```

---

## Community String Brute Force

```bash
nmap -sU -p 161 --script snmp-brute 10.10.10.10
onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp.txt 10.10.10.10
```

---

## SNMP Walk

```bash
snmpwalk -v2c -c public 10.10.10.10
snmp-check 10.10.10.10
```

Targeted OID queries:

```bash
snmpwalk -v1 -c public 10.10.10.10 1.3.6.1.2.1.1           # system info
snmpwalk -v1 -c public 10.10.10.10 1.3.6.1.4.1.77.1.2.25   # user accounts
snmpwalk -v1 -c public 10.10.10.10 1.3.6.1.2.1.25.4.2.1.2  # running processes
snmpwalk -v1 -c public 10.10.10.10 1.3.6.1.2.1.25.6.3.1.2  # installed software
snmpwalk -v1 -c public 10.10.10.10 1.3.6.1.2.1.6.13.1.3    # open TCP ports
```

!!! tip "Real-world"
    SNMP with `public` still shows up constantly on network gear — switches, printers, UPS devices, routers. The OID for running processes and installed software often reveals the exact OS and application versions you need for exploit selection. If you find a read-write community string (`private`), you can potentially modify device config.
