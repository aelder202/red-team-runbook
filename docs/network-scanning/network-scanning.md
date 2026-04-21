```table-of-contents
```

| Goal | Command |
|---|---|
| Fast host discovery (no port scan) | `nmap -sn <range>` |
| Quick top-1000 ports | `nmap -sV --open <target>` |
| Full TCP scan | `nmap -p- -sV --open <target>` |
| UDP (slow, targeted) | `nmap -sU -p 53,161,500,4500 <target>` |
| Aggressive (scripts + OS + traceroute) | `nmap -A <target>` |
| Script scan on open ports | `nmap -sC -sV -p <ports> <target>` |
| Firewall evasion | `nmap -sS -f --mtu 8 <target>` |

!!! tip "Tip"
    Run a fast top-port scan first (`nmap -sV --open <target>`), note open ports, then do a targeted full scan (`nmap -p- <target>`) in the background. Don't wait for the full scan before starting enumeration.

!!! warning "Watch out"
    `-A` and `--script=vuln` are loud — they trigger IDS rules. On real engagements, start with `-sS` SYN scans and escalate. On HTB, noise doesn't matter — scan aggressively to save time.

## Rustscan

```bash
rustscan -a $IP --ulimit 5000 | tee rustscan.txt
```

[GitHub: RustScan](https://github.com/bee-san/RustScan)

---
## Autorecon

AutoRecon automates enumeration by running Nmap and various other scanning tools.

```bash
autorecon -vv --only-scans $IP
```

[GitHub: AutoRecon](https://github.com/Tib3rius/AutoRecon)

---
## Nmap Automator

```
nmapAutomator -H $IP -t recon
```
https://github.com/21y4d/nmapAutomator

---
## Nmap

### Full Port Scan
```bash
nmap -sC -sV -p- $IP -oN nmap_full.txt
```

### Fast Initial Port Discovery

```bash
set -gx IP $IP
set -gx ports (sudo nmap -sS -p- -T3 -n --open --min-rate 300 --max-retries 3 --host-timeout 10m $IP -oG - \
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
sudo nmap -sS -p$ports -sC -sV -T3 -n --version-all -oG scan_tcp $IP
```

### Comprehensive UDP Scan

```bash
sudo nmap -sU --top-ports 1000 --min-rate=1000 -T4 -sC -sV -oA scan_udp $IP
```

### OS Detection

```bash
nmap -O --osscan-guess $IP
```

### Basic Scan

```bash
nmap -sV -sC -oA scan $IP
```

### Full Port Scan

```bash
nmap -p- -T4 -oA full_scan $IP
```

### Full Vulnerability Scan

```bash
nmap -v -sS -Pn --script vuln --script-args=unsafe=1 -oA full_vuln_scan $IP
```

### Vulners Vulnerability Script

```bash
nmap -v -sS -Pn --script nmap-vulners -oA full_vuln_scan $IP
```

### SMB Vulnerability Scan

```bash
nmap -v -sS -p 445,139 -Pn --script smb-vuln* --script-args=unsafe=1 -oA smb_vuln_scan $IP
```

---
## Additional Scanning Methods

### Banner Grabbing with Netcat

```bash
nc -nv $IP 80
```

### Web Enumeration with Nikto

```bash
nikto -h http://$IP
```

### Top 20 Port Sweep

```bash
nmap -sT -A --top-ports=20 $IP -oG top_ports_scan.txt
```
