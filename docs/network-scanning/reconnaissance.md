# Reconnaissance

!!! tip "Tip"
    Start passive before going active — WHOIS, certificate transparency, and search engines leave no trace on the target. Move to active DNS brute-forcing and port probing only after passive sources are exhausted.

## Passive Recon

### WHOIS

```bash
whois example.com
whois 10.10.10.10
```

---

### DNS Lookups

Use `dig` — `nslookup` is dated and harder to parse.

```bash
dig example.com ANY +noall +answer
dig example.com MX +short
dig example.com NS +short
dig -x 10.10.10.10 +short              # reverse lookup
dig @<dc-ip> example.com AXFR           # zone transfer
```

`dnsrecon` automates the same checks and attempts AXFR across every nameserver:

```bash
dnsrecon -d example.com
dnsrecon -d example.com -t axfr
```

---

### Certificate Transparency (crt.sh)

CT logs are the single best passive source for subdomains — every public cert issued is logged.

```bash
curl -s 'https://crt.sh/?q=%25.example.com&output=json' \
  | jq -r '.[].name_value' | sort -u
```

---

### Subdomain Enumeration (Passive)

```bash
subfinder -d example.com -silent
amass enum -passive -d example.com
assetfinder --subs-only example.com
theHarvester -d example.com -b all
```

Pipe results into `httpx` to probe which subdomains are live:

```bash
subfinder -d example.com -silent | httpx -silent -status-code -title
```

---

### Historical URLs (Wayback Machine)

Archived paths often reveal old admin panels, backup files, and forgotten endpoints.

```bash
waybackurls example.com | tee wayback.txt
gau example.com | tee gau.txt
```

---

### GitHub / Code Search

Leaked credentials, API keys, and internal hostnames frequently end up in public repos.

```bash
# Manual GitHub dorks
"example.com" password
"example.com" api_key
org:example filename:.env

# Automated
trufflehog github --org=example
gitleaks detect --source . --verbose
```

---

### Google Dorking

```
site:example.com filetype:pdf
site:example.com ext:xml
site:example.com intitle:"index of"
site:example.com inurl:admin
```

---

### Shodan

```bash
shodan search "Apache country:US org:\"Example Corp\""
shodan host 10.10.10.10
```

---

### Netcraft Site Report

Netcraft's site report returns hosting, nameservers, and tech stack for a given domain. Use the URL directly — there's no grep-from-homepage shortcut.

```
https://sitereport.netcraft.com/?url=example.com
```

---

## Active Recon

### DNS Brute-Forcing

```bash
dnsrecon -d example.com -D /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -t brt
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

---

### Virtual Host Brute-Forcing

When a webserver hosts multiple vhosts on the same IP, brute-force the `Host` header:

```bash
ffuf -u http://10.10.10.10 -H "Host: FUZZ.example.com" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  -fs <size-to-filter>
```

`-fs` filters out the baseline response size so only hits that return different content are shown.

---

### Host Discovery

Sweep a range for live hosts before full port scans:

```bash
nmap -sn -PE -PA21,23,80,3389 10.10.10.0/24
```

For local-segment work, ARP is faster and more reliable than ICMP:

```bash
sudo arp-scan -l
sudo netdiscover -r 192.168.1.0/24
```

See [Network Scanning](network-scanning.md) for port scanning and service detection.

---

### Banner Grabbing

Quick version checks without full `-sV`:

```bash
nc -nv 10.10.10.10 80
curl -I http://10.10.10.10
curl -sI https://10.10.10.10 -k | grep -iE 'server|x-powered-by'
```

---

### Scanning Through a Proxy

When direct scanning is blocked or you're pivoting through a SOCKS proxy:

```bash
proxychains nmap -sT -Pn -p 80,443 10.10.10.10
```

TCP connect (`-sT`) is required — `proxychains` can't tunnel raw SYN packets. See [Tunneling](../port-forwarding/index.md).

---

## Next Steps

Once you have live hosts and open ports, move to protocol-specific enumeration in the [Services](../information-gathering/index.md) section — SMB, SMTP, SNMP, LDAP, and everything else is covered there with per-port commands.

!!! tip "Real-world"
    On external engagements, CT logs + `subfinder` + `httpx` will surface 80% of the attack surface in the first ten minutes. Wayback and GitHub dorking frequently hand over credentials or forgotten staging subdomains that bypass every WAF the client pays for.
