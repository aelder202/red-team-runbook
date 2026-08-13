# Network Scanning

!!! tip ""
    Discover ports quickly, start the full TCP scan in parallel, and enumerate confirmed services while it runs.

## Host Discovery

### Local IPv4 Segment

ARP is the most reliable way to identify reachable IPv4 hosts on the local broadcast domain. Specify the interface when the scanning host has multiple physical, VPN, or tunnel interfaces.

```bash
sudo arp-scan --interface=eth0 192.168.1.0/24
sudo netdiscover -i eth0 -r 192.168.1.0/24
sudo nmap -sn -PR -n 192.168.1.0/24 -oA nmap/hosts-arp
```

### Routed Subnet

Mix ICMP, TCP SYN/ACK, and UDP probes. A response to any probe is enough for Nmap to mark the host up.

```bash
sudo nmap -sn -PE -PP -PS22,80,443,3389 -PA80,443 -PU53,161 -n 10.10.10.0/24 -oA nmap/hosts-routed
```

If a known host does not respond to discovery, retry the port scan with `-Pn`. For ranges, scan the discovered hosts first and use `-Pn` selectively for coverage gaps.

### Target Files and Exclusions

Preview a target file before sending probes:

```bash
nmap -sL -n -iL targets.txt
```

Exclude prohibited or out-of-scope addresses from range scans:

```bash
sudo nmap -sn -n -iL targets.txt --excludefile exclude.txt -oA nmap/hosts
```

`-n` disables reverse-DNS lookups. Remove it when PTR records are useful and DNS queries are acceptable.

---

## TCP Port Discovery

### Quick Nmap Scan

Use the first pass for port discovery only. Run version detection and NSE after the port list is known.

```bash
sudo nmap -sS -Pn -n --top-ports 1000 --open -oA nmap/quick 10.10.10.10
```

Nmap's default set is the 1,000 most commonly observed TCP ports, not ports 1 through 1000.

### Full TCP Scan

```bash
sudo nmap -sS -Pn -n -p- --open -oA nmap/full 10.10.10.10
```

`-p-` scans TCP ports 1 through 65535, including the ports checked by the quick scan. If raw-packet access is unavailable, use `-sT` instead of `-sS`.

For a stable link with a measured acceptable packet rate:

```bash
sudo nmap -sS -Pn -n -p- --open --min-rate <tested-pps> --max-retries <tested-retries> -oA nmap/full-fast 10.10.10.10
```

`--min-rate` sets a speed floor; it does not improve reliability. Rates that exceed the path or target capacity can cause missed ports. Repeat important high-speed results with adaptive timing or a lower rate.

### RustScan

RustScan performs fast TCP connect scans, then passes the discovered ports and everything after `--` to Nmap:

```bash
rustscan -a 10.10.10.10 -- -Pn -n -sV -oA nmap/rustscan
```

`-Pn` is passed to Nmap because RustScan has already demonstrated that the target accepted a TCP connection. Without it, the Nmap handoff can still stop when its separate discovery probes are filtered.

Tune RustScan with `-b <batch-size>` and `-T <timeout-ms>`. Higher batch sizes and shorter timeouts are faster but can miss ports or place unnecessary load on sensitive targets. Prefer Nmap when stability matters more than scan time.

### Masscan

Use Masscan for large, explicitly scoped ranges, then confirm every result with Nmap:

```bash
sudo masscan 10.10.0.0/16 -p1-65535 --rate <tested-pps> --excludefile exclude.txt -oX nmap/masscan.xml

nmap -Pn -n -sV -p<ports-from-masscan> -oA nmap/services <host-from-masscan>
```

Start with a conservative rate and raise it only after confirming that the scanning host, network path, and target environment can handle the traffic.

---

## Service, OS, and NSE Follow-Up

### Service Detection

Run version detection only against confirmed ports:

```bash
sudo nmap -sS -Pn -n -sV -p22,80,443,445,3389 -oA nmap/services 10.10.10.10
```

Treat banners and CPE matches as leads. Proxies, load balancers, backported packages, and deliberately altered banners can produce misleading versions.

### NSE Scripts

`-sC` runs the `default` script category. It does not mean `default and safe`, and a small number of default scripts may still be intrusive.

```bash
# Default scripts on confirmed ports
sudo nmap -sS -Pn -n -sV -sC -p22,80,443,445 -oA nmap/default-scripts 10.10.10.10

# Focused HTTP checks
nmap -Pn -n -sV -p80,443,8080,8443 --script "http-title,http-headers,http-methods" 10.10.10.10

# Focused SMB checks
nmap -Pn -n -sV -p139,445 --script "smb-protocols,smb2-security-mode,smb2-time,smb-os-discovery" 10.10.10.10
```

Preview an NSE selection before running it:

```bash
nmap --script-help "default"
nmap --script-help "vuln and safe"
```

| Selection | Use |
|---|---|
| `default` / `-sC` | Common service information; review the selected scripts |
| `safe` | Lower-risk discovery scripts, not a guarantee of harmless behavior |
| `discovery` | Additional host, service, share, and directory information |
| `auth` | Authentication and anonymous-access checks; may generate auth events |
| `vuln` | Vulnerability checks with mixed behavior; inspect scripts individually |
| `brute`, `exploit`, `dos` | Explicit authorization only |

### OS Detection

OS fingerprinting is most reliable when Nmap can test at least one open and one closed TCP port:

```bash
sudo nmap -O -Pn -n -p<open-port>,<closed-port> -oA nmap/os 10.10.10.10
```

Use `--osscan-limit` when scanning multiple hosts so Nmap skips targets without suitable fingerprinting conditions.

### Vulnerability Leads

```bash
# Only scripts categorized as both vuln and safe
nmap -Pn -n -sV --script "vuln and safe" -p<ports> 10.10.10.10

# Version/CPE matches from the external Vulners service
nmap -Pn -n -sV --script vulners --script-args vulners.mincvss=7.0 -p<ports> 10.10.10.10
```

`vulners` sends detected software names, versions, or CPEs to a third-party API. Use it only when that disclosure is acceptable. A version-to-CVE match is not a verified finding; confirm the installed build, patch state, configuration, and behavior.

Move confirmed services into the matching [service playbook](../information-gathering/index.md) for deeper enumeration and validation.

---

## UDP and IPv6

### UDP

Start with the most common UDP ports, then run version detection against the ports that remain `open` or `open|filtered`:

```bash
sudo nmap -sU -Pn -n --top-ports 100 -oA nmap/udp-top 10.10.10.10

sudo nmap -sU -sV -Pn -n -p53,67,68,69,111,123,137,138,161,162,500,4500,514,623,1900,5353 -oA nmap/udp-targeted 10.10.10.10
```

High-value UDP services include DNS, DHCP, TFTP, RPC, NTP, NetBIOS, SNMP, IKE, Syslog, IPMI, SSDP, and mDNS.

An exhaustive UDP scan is valid when scope, stability, and available time require it:

```bash
sudo nmap -sU -Pn -n -p- --open -oA nmap/udp-full 10.10.10.10
```

UDP scans are slow because many open and filtered services do not respond. Use `-sV` on the reduced result set to help distinguish truly open ports from `open|filtered`.

### IPv6

Do not assume IPv4 discovery provides IPv6 coverage. Start with addresses collected from DNS, neighbor tables, application responses, or other reconnaissance rather than attempting to sweep an entire `/64`.

```bash
ip -6 neigh show

# Link-local addresses require an interface zone
sudo nmap -6 -sn -n 'fe80::1%eth0'

# Known IPv6 target
sudo nmap -6 -sS -Pn -n -p- --open -oA nmap/ipv6-full <ipv6-target>
```

---

## Pivots and Filtering

### SOCKS Proxy

`proxychains` can proxy TCP connect scans, not raw SYN scans:

```bash
proxychains nmap -sT -Pn -n -p22,80,443,445,3389 10.10.20.10
```

Scan a focused port set first. Full connect scans through a high-latency proxy can be extremely slow and may overload the pivot. Route-based tunnels such as Ligolo-ng can support normal routed tooling; see [Port Forwarding](../port-forwarding/index.md).

### Filtering Diagnostics

Use state reasons and a small packet trace before changing scan techniques:

```bash
# Explain why each port received its state
sudo nmap -sS -Pn -n --reason -p22,80,443 10.10.10.10

# Map whether a firewall permits packets; ACK scans do not identify open ports
sudo nmap -sA -Pn -n --reason -p22,80,443 10.10.10.10

# Inspect one port without producing an unmanageable trace
sudo nmap -sS -Pn -n --packet-trace -p443 10.10.10.10
```

!!! warning "Authorized evasion testing"
    Test fragmentation, source-port manipulation, padding, timing changes, or controlled decoys one at a time and only when they are explicitly in scope. Avoid random decoys: spoofed third-party addresses create unnecessary traffic, and unsuitable decoys can reduce accuracy or contribute to SYN-flood-like behavior. Fragmentation and decoys also do not cover Nmap version detection or NSE connections.

---

## Output and Handoff

`-oA <basename>` saves normal, XML, and grepable output. Grepable output remains convenient for one-off shell extraction but is deprecated; prefer XML for durable automation.

```bash
# Exact open TCP states from grepable output; excludes open|filtered
grep -oP '\d+(?=/open/tcp)' nmap/full.gnmap | sort -nu | paste -sd,

# Exact open TCP states from XML
xmlstarlet sel -t -m '//port[@protocol="tcp"][state/@state="open"]' -v '@portid' -n nmap/full.xml | sort -nu | paste -sd,
```

Guard against an empty port list before launching the service scan:

```bash
ports=$(grep -oP '\d+(?=/open/tcp)' nmap/full.gnmap | sort -nu | paste -sd,)

if [ -n "$ports" ]; then
  sudo nmap -sS -Pn -n -sV -sC -p"$ports" -oA nmap/services 10.10.10.10
fi
```

Nmap overwrites an existing basename, so use a separate directory or a target- and date-specific name for repeated scans. Resume an interrupted scan from its saved output:

```bash
sudo nmap --resume nmap/full.nmap
```

After confirming a service, continue with the relevant [service-analysis page](../information-gathering/index.md), such as [HTTP/HTTPS](../information-gathering/service-analysis/http-80-443.md), [SMB](../information-gathering/service-analysis/smb.md), [LDAP](../information-gathering/service-analysis/ldap.md), or [SNMP](../information-gathering/service-analysis/snmp.md).
