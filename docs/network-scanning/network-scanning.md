# Network Scanning

!!! tip ""
    Two-phase approach: quick scan first to identify open ports, then launch a full scan in the background while you start enumeration. Don't wait for `-p-` to finish — by the time it completes you should already have a foothold on whatever the quick scan surfaced.

---

## Host Discovery (Local Segment)

On an internal engagement where you have L2 access to the target subnet, ARP is faster and more reliable than ICMP sweeps — every live host on the segment must answer ARP, and most host firewalls won't block it.

```bash
sudo arp-scan -l                        # auto-detect interface and subnet
sudo arp-scan 192.168.1.0/24
sudo netdiscover -r 192.168.1.0/24
```

For remote subnets, mix ICMP echo, TCP ACK, and SYN probes against ports the host firewall is likely to permit:

```bash
nmap -sn -PE -PP -PS21,22,80,443,3389 -PA80,443 10.10.10.0/24
```

!!! tip "Real-world"
    On hardened networks, hosts often drop ICMP entirely — ping sweeps return zero results even when the subnet is full of live machines. If host discovery turns up nothing, **skip it entirely with `-Pn`** and let the port scan tell you what's alive.

---

## Phase 1: Quick Scan

Hit the top 1000 ports and identify services fast. Run this first, then start enumerating immediately.

```bash
nmap -sV -sC --open -T4 -Pn -oA quick 10.10.10.10
```

| Flag | Purpose |
|------|---------|
| `-sV` | Service/version detection |
| `-sC` | Default NSE scripts (`safe` + `default` categories) |
| `-Pn` | Skip host discovery — assume host is up |
| `-oA quick` | Save normal/grepable/XML output (`quick.nmap`, `.gnmap`, `.xml`) |
| `-T4` | Aggressive timing — fine for most networks, drop to `-T3` if you see drops |

!!! warning "Always use `-Pn` on real engagements"
    Without `-Pn`, nmap sends ICMP/ARP probes first and skips any host that doesn't reply. Modern Windows hosts, hardened Linux servers, and most cloud instances drop ICMP by default — you'll miss them entirely. Make `-Pn` your default and only drop it when sweeping a range where you genuinely don't know which hosts exist.

RustScan is faster for port discovery on a known-up host — it finds open ports in seconds, then hands off to nmap for service detection:

```bash
rustscan -a 10.10.10.10 --ulimit 5000 -- -sV -sC -oA quick
```

---

## Phase 2: Full Port Scan

Run in the background while you work on what Phase 1 found. Catches anything above port 1000.

```bash
sudo nmap -p- -sS -Pn --min-rate 1000 --open -oA full 10.10.10.10
```

| Flag | Purpose |
|------|---------|
| `-p-` | All 65535 TCP ports |
| `-sS` | SYN stealth scan (requires root, faster and quieter than `-sT`) |
| `--min-rate 1000` | Pin packet rate floor — more reliable than `-T4` on slow links |
| `--max-retries 2` | Cut retransmit time on filtered ports |

If you can't run as root (or you're tunneling through `proxychains`), use `-sT` instead — full TCP connect, slower but works without raw socket access.

!!! tip "Tuning over timing templates"
    `-T4` is fine as a default, but on flaky networks `--min-rate`/`--max-retries`/`--host-timeout` give you finer control. On solid links, `--min-rate 5000` against a single host is significantly faster than any `-T` template alone.

For very large ranges (`/16` and up), drop nmap and use masscan for initial port discovery, then feed the output back into nmap for service detection:

```bash
sudo masscan -p1-65535 10.10.0.0/16 --rate=10000 -oG masscan.gnmap
```

---

## Service & Script Scan

Once you have a port list from Phase 1/2, run a focused scan with version detection and the relevant NSE categories:

```bash
nmap -sV -sC -p 22,80,443,445,3389 --version-intensity 7 -Pn \
     -oA services 10.10.10.10
```

NSE script categories worth knowing — combine with `--script`:

| Category | Use case |
|----------|----------|
| `default`, `safe` | Run by `-sC`. Safe to use everywhere. |
| `discovery` | Extra enumeration (NetBIOS names, DNS records, SMB shares). |
| `version` | Aggressive version probing (combined with `-sV --version-intensity 9`). |
| `auth` | Default-cred and anonymous-bind checks. |
| `vuln` | Known-CVE checks. **Some are intrusive** — see warning below. |
| `brute` | Credential brute-forcers. Loud and slow — usually not what you want. |
| `exploit` | Active exploitation. Treat like `vuln`. |

```bash
nmap -p 445 --script "smb-vuln-* and safe" 10.10.10.10
nmap -p 80,443 --script "http-enum,http-title,http-headers" 10.10.10.10
```

---

## OS Detection

Useful when you need to confirm Windows vs Linux before queueing up follow-up tooling. Runs alongside `-sV`:

```bash
sudo nmap -O -sV -Pn 10.10.10.10
```

Less reliable than fingerprinting a known service (SMB, SSH banners, HTTP `Server` headers) — treat the result as a hint, not gospel.

---

## UDP (Targeted)

UDP is slow and noisy — never `-sU -p-`. Scan for the specific services you actually care about:

```bash
sudo nmap -sU --top-ports 50 -Pn 10.10.10.10
sudo nmap -sU -sV -p 53,69,111,123,161,500,4500,514,623 -Pn 10.10.10.10
```

Common high-value UDP ports: DNS (53), TFTP (69), NTP (123), SNMP (161), IKE (500/4500), Syslog (514), IPMI (623).

---

## Firewall / IDS Evasion

When something's clearly between you and the host, escalate carefully — these flags make scans louder, not quieter, against any halfway competent monitoring stack.

```bash
nmap -Pn -f -D RND:5 --source-port 53 --data-length 24 -p 80,443 10.10.10.10
```

| Flag | Effect |
|------|--------|
| `-Pn` | Skip discovery — covered above. The single most useful evasion flag. |
| `-f` / `--mtu 16` | Fragment packets to slip past simple packet inspection. |
| `-D RND:5` | Spoof 5 random decoy source IPs alongside your real one. |
| `--source-port 53` | Many old ACLs trust source port 53/DNS. Worth trying against ancient firewalls. |
| `--data-length 24` | Pad packets to dodge length-based signatures. |
| `-T2` / `-T1` | "Polite"/"sneaky" timing. Useful when you actually need to evade IDS. |

!!! warning "Authorization"
    Evasion techniques can produce alerts that look like a real attack and may breach engagement scope. Only use them when explicitly in-scope and coordinated with the blue team or client.

---

## Saving & Reusing Output

Always save with `-oA` — the grepable (`.gnmap`) format pipes cleanly into shell tools, the XML feeds tools like Metasploit (`db_import`) and EyeWitness (`-x`), and the normal output is what you'll paste into the report.

```bash
# Pull just the open ports as a comma-separated list
grep -oP '\d+/open' full.gnmap | cut -d/ -f1 | sort -nu | paste -sd,

# Feed into the next nmap run
ports=$(grep -oP '\d+/open' full.gnmap | cut -d/ -f1 | sort -nu | paste -sd,)
nmap -sV -sC -p"$ports" -Pn -oA services 10.10.10.10
```

For multi-host scans, drive nmap from a target file:

```bash
nmap -sV -sC -Pn -iL targets.txt -oA sweep
```

---

## Vulnerability Scanning

Quick CVE-aware sweep across whatever services Phase 1/2 turned up. Useful for picking out low-hanging fruit before deep-diving each service — not a substitute for a real vulnerability scanner.

### General sweep (broad)

```bash
nmap -sV -Pn --script "vuln and safe" -p <ports> 10.10.10.10
nmap -sV -Pn --script vulners -p <ports> 10.10.10.10
```

`vulners` is the highest-signal script in the box — it takes `-sV` banners and queries vulners.com for matching CVEs. Run it on every engagement.

```bash
nmap -sV -Pn --script vulners --script-args mincvss=7.0 -p <ports> 10.10.10.10
```

!!! warning "`--script vuln` is intrusive"
    The unfiltered `vuln` category includes scripts that send real exploit payloads (`smb-vuln-ms17-010`, `http-shellshock`, etc.) and can crash unpatched services. Default to `"vuln and safe"` and only widen the filter when you've scoped exploitation with the client.

### Targeted scripts by service

| Service | Useful scripts |
|---------|----------------|
| SSL/TLS (443, 8443, 636, 993, 995) | `ssl-heartbleed`, `ssl-poodle`, `ssl-ccs-injection`, `ssl-dh-params`, `ssl-cert`, `ssl-enum-ciphers` |
| HTTP/HTTPS (80, 443, 8080, 8443) | `http-vuln-*`, `http-shellshock`, `http-enum`, `http-title`, `http-headers`, `http-methods`, `http-robots.txt` |
| SMB (139, 445) | `smb-vuln-ms17-010`, `smb-vuln-ms08-067`, `smb2-security-mode`, `smb-os-discovery` — see [SMB](../information-gathering/service-analysis/smb.md) |
| RDP (3389) | `rdp-ntlm-info`, `rdp-vuln-ms12-020`, `rdp-enum-encryption` |
| DNS (53) | `dns-recursion`, `dns-zone-transfer`, `dns-cache-snoop` |
| FTP (21) | `ftp-anon`, `ftp-vsftpd-backdoor`, `ftp-proftpd-backdoor` |
| SSH (22) | `ssh2-enum-algos`, `ssh-hostkey`, `ssh-auth-methods` |
| SMTP (25, 465, 587) | `smtp-enum-users`, `smtp-vuln-cve2010-4344`, `smtp-open-relay` |
| SNMP (161/udp) | `snmp-info`, `snmp-brute`, `snmp-processes`, `snmp-win32-software` |

```bash
# SSL/TLS posture on every HTTPS-ish port at once
nmap -sV -Pn -p 443,636,993,995,8443 \
  --script "ssl-heartbleed,ssl-poodle,ssl-ccs-injection,ssl-enum-ciphers" 10.10.10.10

# HTTP enumeration + common CVE checks
nmap -sV -Pn -p 80,443,8080 --script "http-enum,http-title,http-methods,http-vuln-*" 10.10.10.10
```

Service-specific exploitation, default-cred testing, and deep enumeration live in the [Services](../information-gathering/index.md) section — each port has its own page.
