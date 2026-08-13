# DNS (53)

!!! tip "Start here"
    Try zone transfer first: `dig axfr @$DC_IP $DOMAIN`. Internal DNS servers are commonly misconfigured and will hand you the full record set, subdomains, internal IPs, mail servers, everything.

---

## Banner Grabbing

```bash
nmap -sU -p 53 --script dns-nsid,dns-version $DC_IP
dig CH TXT version.bind @$DC_IP
```

---

## Zone Transfer

```bash
dig axfr @$DC_IP $DOMAIN
host -t axfr $DOMAIN $DC_IP
nmap --script=dns-zone-transfer -p 53 $DC_IP
```

---

## Subdomain Enumeration

```bash
# Passive - no direct contact with target
subfinder -d $DOMAIN
amass enum -passive -d $DOMAIN

# Active brute force
gobuster dns -d $DOMAIN -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t 50
dnsenum --dnsserver $DC_IP -f /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt $DOMAIN
```

!!! tip "Real-world"
    Start with passive enumeration (`subfinder`, `amass -passive`) before touching the target's DNS server, passive techniques are invisible to the client's logging. Save active brute force for later or when passive results are thin.

---

## Reverse DNS Lookup

```bash
dig -x $DC_IP
nslookup $DC_IP
```

---

## Basic Record Queries

```bash
dig A $DOMAIN @$DC_IP       # IPv4 address
dig MX $DOMAIN @$DC_IP      # Mail servers
dig NS $DOMAIN @$DC_IP      # Name servers
dig TXT $DOMAIN @$DC_IP     # SPF, DKIM, verification records
dig ANY $DOMAIN @$DC_IP     # All records
```
