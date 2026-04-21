!!! tip "Start here"
    Default community string is `public`. Try: `snmpwalk -v2c -c public <target>`. If it returns data, enumerate further with `snmp-check <target>` for users, processes, and network interfaces.

!!! warning "Watch out"
    SNMPv1/v2c sends community strings in plaintext. If you capture the community string, you can query the full MIB. SNMPv3 requires credentials — brute force is slow.

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