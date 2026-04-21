```table-of-contents
```
**Domain Name System (DNS)** is responsible for translating domain names into IP addresses. It operates over **UDP/TCP port 53**. Attackers exploit **misconfigured DNS servers** to perform **subdomain enumeration, zone transfers, cache poisoning, and exfiltration via DNS tunneling**.
## Common Attack Vectors

- **DNS Zone Transfer Misconfiguration** – Exposes internal domain records.
- **Subdomain Enumeration** – Identifies attack surfaces by discovering hidden services.
- **DNS Cache Poisoning** – Redirects users to malicious servers.
- **DNS Rebinding Attacks** – Bypasses same-origin policy in web applications.
- **Data Exfiltration via DNS Tunneling** – Bypasses security controls to exfiltrate data.

**Bookmarks:**
[https://github.com/OWASP/Amass](https://github.com/OWASP/Amass)  
[https://github.com/projectdiscovery/subfinder](https://github.com/projectdiscovery/subfinder)
## Enumeration
### Banner Grabbing
```bash
nmap -sU -p 53 --script dns-nsid,dns-version <target-ip>
```

Dig (Query DNS Version):
```bash
dig CH TXT version.bind @<target-ip>
```
## DNS Zone Transfer (AXFR)
A zone transfer allows a secondary DNS server to replicate all DNS records from the primary server. If misconfigured, an attacker can retrieve subdomains, IP addresses, internal networks, and mail servers.

```bash
host -t axfr <target-domain> <dns-server>
```
If successful, the response will contain **entire domain records**, exposing internal infrastructure.

### Using Nmap
```bash
nmap --script=dns-zone-transfer -p53 <target-ip>
```

## Subdomain Enumeration
Gobuster:
```bash
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t 50
```

Subfinder:
```bash
subfinder -d example.com
```

Nmap:
```bash
nmap --script dns-brute -p 53 <target-ip>
```

Amass:
```bash
amass enum -d example.com
```

## Reverse DNS Lookup (Hostname)
```bash
dig -x <target-ip>
```

or

```bash
nslookup <target-ip>
```

