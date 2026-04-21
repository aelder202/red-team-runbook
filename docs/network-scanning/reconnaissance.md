```table-of-contents
```

!!! tip "Tip"
    Start passive before going active — WHOIS, Shodan, and Google dorking leave no trace on the target. Move to active DNS brute-forcing and port scanning only after passive recon is exhausted.

## Passive Recon

### WHOIS Enumeration

Retrieve domain registration details:

```
whois <target-domain>
```

Reverse lookup an IP address:

```
whois <target-ip>
```

### DNS Enumeration

Attempt a Zone Transfer:

```
dnsrecon -d <target-domain> -t axfr
```

Using nslookup interactively:

```
nslookup
> server <target-dns-server>
> set type=any
> <target-domain>
```

### Google Dorking

Find indexed PDFs related to a company:

```
site:<target-domain> filetype:pdf
```

Other useful dorks:

- `ext:xml` → Find indexed XML files.
    
- `intitle:”index of”` → Locate open directory listings.
    

### Shodan

Search for exposed assets on Shodan:

```
shodan search "<query>"
```

Example:

```
shodan search "Apache country:US"
```

### Netcraft

Retrieve server information:

```
curl -s https://www.netcraft.com | grep "<target-domain>"
```

---
## Active Recon

Active reconnaissance involves interacting directly with the target to gather information.

### DNS Brute Forcing

Find subdomains using a wordlist:

```
dnsrecon -d <target-domain> -D /path/to/wordlist.txt -t brt
```

### Port Scanning

Fast TCP scan with live host detection:

```
nmap -sn -PE -PA21,23,80,3389 <target-subnet>
```

### OS Detection

Aggressive OS guessing:

```
nmap -O --osscan-guess --max-retries 1 <target-ip>
```

### SMB Enumeration

List shared folders:

```
smbclient -L //<target-ip> -N
```

Enumerate user accounts:

```
enum4linux -a <target-ip>
```

#### SMTP User Enumeration

Check for valid user accounts:

```
nc -nv <target-ip> 25
HELO attacker.com
VRFY admin
```

### SNMP Information Gathering

Retrieve system details via SNMP:

```
snmpwalk -c public -v2c <target-ip>
```

---
## Additional Recon Methods

### Banner Grabbing

Using Netcat:

```
nc -nv <target-ip> 80
```

Using cURL:

```
curl -I http://<target-ip>
```

### Checking for Open Proxies

Identify proxy servers:

```
proxychains nmap -sT -p 80,443 <target-ip>
```

### Brute-Force Subdomain Discovery

Using wfuzz:

```
wfuzz -c -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -H "Host: FUZZ.<target-domain>" http://<target-ip>
```