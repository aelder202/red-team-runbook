# SNMP (161, 162)

!!! tip "Start here"
    Default community string is `public`. Try: `snmpwalk -v2c -c public $IP`. If it returns data, enumerate further with `snmp-check $IP` for users, running processes, and installed software. SNMPv1/v2c sends community strings in cleartext. Capture it from the wire if you can.

!!! warning "Watch out"
    SNMPv3 requires credentials and brute forcing is slow. SNMPv1/v2c is the target.

---

## Enumeration

```bash
sudo nmap -sU -p 161 --script snmp-info,snmp-sysdescr $IP
```

---

## Community String Brute Force

```bash
nmap -sU -p 161 --script snmp-brute $IP
onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp.txt $IP
```

---

## SNMP Walk

```bash
snmpwalk -v2c -c public $IP
snmp-check $IP
```

Targeted OID queries:

```bash
snmpwalk -v1 -c public $IP 1.3.6.1.2.1.1           # system info
snmpwalk -v1 -c public $IP 1.3.6.1.4.1.77.1.2.25   # user accounts
snmpwalk -v1 -c public $IP 1.3.6.1.2.1.25.4.2.1.2  # running processes
snmpwalk -v1 -c public $IP 1.3.6.1.2.1.25.6.3.1.2  # installed software
snmpwalk -v1 -c public $IP 1.3.6.1.2.1.6.13.1.3    # open TCP ports
```
