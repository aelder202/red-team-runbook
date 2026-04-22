# Network Scanning & Recon

Start here on every engagement. The goal is to build an accurate map of the attack surface before touching anything — what hosts are alive, what ports are open, what services are running, and who's on the network.

---

## Methodology

### 1. Passive Recon

Before sending a single packet, collect what's publicly available. Useful for external assessments and building a target list.

```bash
whois example.com
dig example.com ANY
```

Check certificate transparency for subdomains:

```bash
curl -s "https://crt.sh/?q=%.example.com&output=json" | jq '.[].name_value' | sort -u
```

See [Reconnaissance](reconnaissance.md) for OSINT techniques, subdomain enumeration, and Google dorking.

!!! tip "Real-world"
    On external engagements, passive recon often surfaces forgotten subdomains, exposed staging environments, and legacy VPN portals that don't appear in scope documents. Check before you scan.

---

### 2. Host Discovery

Identify live hosts before port scanning — especially important on large subnets.

```bash
nmap -sn 10.10.10.0/24
```

On an internal segment, ARP sweep is more reliable than ICMP — many hosts block ping but can't hide from ARP:

```bash
nmap -PR -sn 10.10.10.0/24
```

!!! warning "Watch out"
    Confirm target IPs are in scope before scanning. On real engagements, verify against the scope document — hitting out-of-scope hosts, even accidentally, is a significant problem.

---

### 3. Port Scanning

Quick scan first to get something to work with, full scan in the background while you start enumerating.

**Quick scan (top 1000 ports):**

```bash
nmap -sV --open -T4 10.10.10.10
```

**Full TCP (run in background):**

```bash
nmap -p- -T4 --open -oN nmap_full.txt 10.10.10.10
```

**Targeted service scan once you have a port list:**

```bash
nmap -sC -sV -p 22,80,443 10.10.10.10 -oN nmap_services.txt
```

See [Network Scanning](network-scanning.md) for RustScan, UDP scanning, and SMB vuln scripts.

---

### 4. Traffic Capture

Passive listening on an internal network can surface credentials, hashes, and host relationships without touching any target directly.

```bash
sudo tcpdump -i tun0 -w capture.pcap
sudo tcpdump -i eth0 'port 445 or port 389' -w smb_ldap.pcap
```

See [Traffic Capture](traffic-capture.md) for Wireshark filters and protocol-specific capture techniques.

---

### 5. Unauthenticated Network Enumeration

Once you have network access, enumerate users and hosts through null sessions and anonymous binds before attempting any authentication.

```bash
nxc smb 10.10.10.0/24 --gen-relay-list alive.txt    # find SMB hosts
nxc smb 10.10.10.10 -u '' -p '' --users             # null session user enum
rpcclient -U "" -N 10.10.10.10                      # anonymous RPC
```

Protocol-specific enumeration (SMB, LDAP, Kerberos, SMTP, SNMP, etc.) lives in the [Services](../information-gathering/index.md) section — each port has its own page with the relevant commands.

---

### 6. Web Screenshot Sweep

After identifying HTTP/HTTPS services, use EyeWitness to screenshot all of them at once — saves time over opening each manually.

```bash
eyewitness -x nmap_services.xml -d output
```

See [EyeWitness](../applications/tools/eyewitness.md) for usage with target file lists and RDP/VNC capture.
