# Information Gathering & Enumeration

Solid enumeration wins engagements. The goal here isn't to run every tool — it's to build an accurate picture of what's exposed before touching anything.

---

## Methodology

### 1. Host Discovery

```bash
nmap -sn 10.10.10.0/24
```

!!! tip "Real-world"
    On internal engagements, ARP sweep with `-PR -sn` is more reliable than ICMP — many hosts block ping but can't hide from ARP on the same segment. If you're on an external assessment, skip discovery and go straight to port scanning your scoped IP list.

---

### 2. Port Scanning

The approach: kick off a quick Rustscan to get ports fast, then run a full nmap in the background while you start enumerating.

**Quick scan:**
```bash
rustscan -a <target> --ulimit 5000 -- -sV -sC
```

**Full TCP (background):**
```bash
nmap -p- -sV -sC --open -oA nmap_tcp <target>
```

**UDP (background):**
```bash
sudo nmap -sU --top-ports 100 -oN nmap_udp.txt <target>
```

!!! tip "Real-world"
    Drop to `-T2` and avoid `-sC` on the initial sweep against production systems — some NSE scripts are intrusive and have caused service disruptions on fragile hosts. Run scripts only against specific ports once you know what's there. Also save everything with `-oA` from the start; you'll need timestamps if the client asks what hit their systems and when.

!!! warning "Watch out"
    Confirm your target IPs are in scope before running anything. On real engagements, verify against the scope document — scanning out-of-scope hosts, even accidentally, is a significant problem.

---

### 3. Service Enumeration

Work through open ports methodically. Prioritise based on what's most likely to move the engagement forward:

| Priority | Services |
|---|---|
| High | SMB, WinRM, MSSQL, LDAP, RDP |
| High | SSH, FTP, HTTP/HTTPS |
| Medium | DNS, SMTP, SNMP, NFS, Rsync |
| Low | IMAP, POP3, R-Services, TFTP |

See the Service Analysis pages for per-protocol enumeration commands.
