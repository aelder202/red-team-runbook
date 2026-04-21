# DNS (53)

!!! tip "Start here"
    Try zone transfer first: `dig axfr @10.10.10.10 example.com`. Internal DNS servers are commonly misconfigured and will hand you the full record set — subdomains, internal IPs, mail servers, everything.

---

## Banner Grabbing

```bash
nmap -sU -p 53 --script dns-nsid,dns-version 10.10.10.10
dig CH TXT version.bind @10.10.10.10
```

---

## Zone Transfer

```bash
dig axfr @10.10.10.10 example.com
host -t axfr example.com 10.10.10.10
nmap --script=dns-zone-transfer -p 53 10.10.10.10
```

---

## Subdomain Enumeration

```bash
# Passive — no direct contact with target
subfinder -d example.com
amass enum -passive -d example.com

# Active brute force
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t 50
dnsenum --dnsserver 10.10.10.10 -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt example.com
```

!!! tip "Real-world"
    Start with passive enumeration (`subfinder`, `amass -passive`) before touching the target's DNS server — passive techniques are invisible to the client's logging. Save active brute force for later or when passive results are thin.

---

## Reverse DNS Lookup

```bash
dig -x 10.10.10.10
nslookup 10.10.10.10
```

---

## Basic Record Queries

```bash
dig A example.com @10.10.10.10       # IPv4 address
dig MX example.com @10.10.10.10      # Mail servers
dig NS example.com @10.10.10.10      # Name servers
dig TXT example.com @10.10.10.10     # SPF, DKIM, verification records
dig ANY example.com @10.10.10.10     # All records
```
