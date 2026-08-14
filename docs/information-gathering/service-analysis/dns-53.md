# DNS (53)

!!! tip "Start here"
    Try an authorized zone transfer early: `dig axfr @$DC_IP $DOMAIN`. A successful AXFR returns the zone's published record set and can replace substantial active subdomain guessing.

---

## Banner Grabbing

```bash
nmap -sSU -p 53 --script dns-nsid $DC_IP
dig CH TXT version.bind @$DC_IP
```

---

## Zone Transfer

```bash
dig axfr @$DC_IP $DOMAIN
host -t axfr $DOMAIN $DC_IP
nmap -p 53 --script dns-zone-transfer \
  --script-args "dns-zone-transfer.domain=$DOMAIN" $DC_IP
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
dig ANY $DOMAIN @$DC_IP     # Server-selected records; often intentionally minimal
```

Query record types individually when completeness matters. Modern authoritative servers may return a minimal response to `ANY` queries.
