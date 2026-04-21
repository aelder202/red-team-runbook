# Reconnaissance

!!! tip "Tip"
    Start passive before going active — WHOIS, Shodan, and Google dorking leave no trace on the target. Move to active DNS brute-forcing and port scanning only after passive recon is exhausted.

## Passive Recon

### WHOIS Enumeration

```bash
whois example.com
whois 10.10.10.10
```

### DNS Enumeration

Zone transfer attempt:

```bash
dnsrecon -d example.com -t axfr
```

Interactive nslookup:

```
nslookup
> server <target-dns-server>
> set type=any
> example.com
```

### Google Dorking

```
site:example.com filetype:pdf
ext:xml
intitle:"index of"
```

### Shodan

```bash
shodan search "Apache country:US"
```

### Netcraft

```bash
curl -s https://www.netcraft.com | grep "example.com"
```

---

## Active Recon

### DNS Brute Forcing

```bash
dnsrecon -d example.com -D /path/to/wordlist.txt -t brt
```

### Port Scanning

```bash
nmap -sn -PE -PA21,23,80,3389 10.10.10.0/24
```

### OS Detection

```bash
nmap -O --osscan-guess --max-retries 1 10.10.10.10
```

### SMB Enumeration

```bash
smbclient -L //10.10.10.10 -N
enum4linux -a 10.10.10.10
```

### SMTP User Enumeration

```bash
nc -nv 10.10.10.10 25
HELO attacker.com
VRFY admin
```

### SNMP Information Gathering

```bash
snmpwalk -c public -v2c 10.10.10.10
```

---

## Additional Recon Methods

### Banner Grabbing

```bash
nc -nv 10.10.10.10 80
curl -I http://10.10.10.10
```

### Subdomain Brute-Force

```bash
wfuzz -c -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -H "Host: FUZZ.example.com" http://10.10.10.10
```

### Proxy Detection

```bash
proxychains nmap -sT -p 80,443 10.10.10.10
```
