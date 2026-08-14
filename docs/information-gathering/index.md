# Information Gathering & Enumeration

Solid enumeration wins engagements. The goal here isn't to run every tool, it's to build an accurate picture of what's exposed before touching anything.

---

## Methodology

### 1. Host Discovery

```bash
nmap -sn $SUBNET
```

!!! tip "Real-world"
    On internal engagements, ARP sweep with `-PR -sn` is more reliable than ICMP, many hosts block ping but can't hide from ARP on the same segment. If you're on an external assessment, skip discovery and go straight to port scanning your scoped IP list.

---

### 2. Port Scanning

The approach: kick off a quick Rustscan to get ports fast, then run a full nmap in the background while you start enumerating.

**Quick scan:**
```bash
rustscan -a $IP --ulimit 5000 -- -sV -sC
```

**Full TCP (background):**
```bash
nmap -p- -sV -sC --open -oA nmap_tcp $IP
```

**UDP (background):**
```bash
sudo nmap -sU --top-ports 100 -oN nmap_udp.txt $IP
```

!!! tip "Real-world"
    Drop to `-T2` and avoid `-sC` on the initial sweep against production systems, some NSE scripts are intrusive and have caused service disruptions on fragile hosts. Run scripts only against specific ports once you know what's there. Also save everything with `-oA` from the start; you'll need timestamps if the client asks what hit their systems and when.

!!! warning "Watch out"
    Confirm your target IPs are in scope before running anything. On real engagements, verify against the scope document, scanning out-of-scope hosts, even accidentally, is a significant problem.

---

### 3. Service Enumeration

Work through open ports methodically. Prioritise based on what's most likely to move the engagement forward:

| Initial attention | Services |
|---|---|
| High-value unauthenticated checks | HTTP/HTTPS, SMB, LDAP, Kerberos, DNS, Docker API, Redis, Elasticsearch |
| High-value with credentials | WinRM, RDP, SSH, MSSQL, MySQL, PostgreSQL, Oracle TNS, MongoDB |
| Infrastructure-dependent | FTP, NFS, Rsync, SNMP, SMTP, IPMI, IKE/ISAKMP |
| Situational or legacy | IMAP, POP3, VNC, Telnet, R-Services, TFTP, SNMP Multiplexer |

See the Service Analysis pages for per-protocol enumeration commands.

The site-level variables cover common targets (`$IP`, `$SUBNET`, `$LHOST`, `$DOMAIN`, and `$DC_IP`). When a command uses a service-specific shell variable such as `$USERNAME`, `$PASSWORD`, `$SHARE`, or `$DATABASE`, set it locally before running the command. Password prompts are preferred where a client supports them.

Authentication-testing examples assume an approved target list, a checked lockout policy, and deliberately scoped `users.txt` and `passwords.txt` inputs. Do not substitute broad public wordlists during a live engagement without a specific test plan.

Service pages name a CVE only when the service or product can be identified reliably and a stable, non-exploit validation check is useful. Treat banners as leads and confirm affected versions against the vendor advisory before exploitation; product-specific vulnerability catalogs do not belong on every port page.
