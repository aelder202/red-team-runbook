# Network Scanning

| Goal | Command |
|---|---|
| Fast host discovery (no port scan) | `nmap -sn <range>` |
| Quick top-1000 ports | `nmap -sV --open 10.10.10.10` |
| Full TCP scan | `nmap -p- -sV --open 10.10.10.10` |
| UDP (slow, targeted) | `nmap -sU -p 53,161,500,4500 10.10.10.10` |
| Aggressive (scripts + OS + traceroute) | `nmap -A 10.10.10.10` |
| Script scan on open ports | `nmap -sC -sV -p <ports> 10.10.10.10` |
| Firewall evasion | `nmap -sS -f --mtu 8 10.10.10.10` |

!!! tip "Tip"
    Run a fast top-port scan first (`nmap -sV --open 10.10.10.10`), note open ports, then do a targeted full scan (`nmap -p- 10.10.10.10`) in the background. Don't wait for the full scan before starting enumeration.

!!! warning "Watch out"
    `-A` and `--script=vuln` are loud — they trigger IDS rules. On real engagements, start with `-sS` SYN scans and escalate. On HTB, noise doesn't matter — scan aggressively to save time.

## Rustscan

```bash
rustscan -a 10.10.10.10 --ulimit 5000 | tee rustscan.txt
```

---

## Autorecon

```bash
autorecon -vv --only-scans 10.10.10.10
```

---

## Nmap Automator

```bash
nmapAutomator -H 10.10.10.10 -t recon
```

---

## Nmap

### Full Port Scan

```bash
nmap -sC -sV -p- 10.10.10.10 -oN nmap_full.txt
```

### Fast Initial Port Discovery

```bash
set -gx IP 10.10.10.10
set -gx ports (sudo nmap -sS -p- -T3 -n --open --min-rate 300 --max-retries 3 --host-timeout 10m 10.10.10.10 -oG - \
  | awk -F'Ports: ' '/Ports: / {print $2}' \
  | tr -d ' ' \
  | tr ',' '\n' \
  | awk -F'/' '$2=="open" {print $1}' \
  | tr '\n' ',' \
  | sed 's/,$//') \
&& echo $ports
```

### Service Enumeration

```bash
sudo nmap -sS -p$ports -sC -sV -T3 -n --version-all -oG scan_tcp 10.10.10.10
```

### Comprehensive UDP Scan

```bash
sudo nmap -sU --top-ports 1000 --min-rate=1000 -T4 -sC -sV -oA scan_udp 10.10.10.10
```

### OS Detection

```bash
nmap -O --osscan-guess 10.10.10.10
```

### Full Vulnerability Scan

```bash
nmap -v -sS -Pn --script vuln --script-args=unsafe=1 -oA full_vuln_scan 10.10.10.10
```

### Vulners Vulnerability Script

```bash
nmap -v -sS -Pn --script nmap-vulners -oA full_vuln_scan 10.10.10.10
```

### SMB Vulnerability Scan

```bash
nmap -v -sS -p 445,139 -Pn --script smb-vuln* --script-args=unsafe=1 -oA smb_vuln_scan 10.10.10.10
```

---

## Additional Scanning Methods

### Banner Grabbing with Netcat

```bash
nc -nv 10.10.10.10 80
```

### Web Enumeration with Nikto

```bash
nikto -h http://10.10.10.10
```

### Top 20 Port Sweep

```bash
nmap -sT -A --top-ports=20 10.10.10.10 -oG top_ports_scan.txt
```
