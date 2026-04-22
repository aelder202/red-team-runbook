# Network Scanning

!!! tip ""
    Two-phase approach: quick scan first to identify open ports, then launch a full scan in the background while you start enumeration. Don't wait for `-p-` to finish — by the time it completes you should already have a foothold on whatever the quick scan surfaced.

---

## Phase 1: Quick Scan

Hit the top 1000 ports and identify services fast. Run this first, then start enumerating immediately.

```bash
nmap -sV --open -T4 10.10.10.10
```

RustScan is faster for port discovery — it finds open ports in seconds, then hands off to nmap for service detection:

```bash
rustscan -a 10.10.10.10 --ulimit 5000 -- -sV
```

---

## Phase 2: Full Port Scan

Run in the background while you work on what Phase 1 found. Catches anything above port 1000.

```bash
nmap -p- -T4 --open -oN nmap_full.txt 10.10.10.10
```

---

## Service & Script Scan

Once you have a port list, run a targeted service scan with default scripts:

```bash
nmap -sC -sV -p 22,80,443 10.10.10.10 -oN nmap_services.txt
```

---

## UDP (Targeted)

UDP is slow — only scan for specific services you suspect. Common targets: DNS (53), SNMP (161), NFS (111), IKE (500/4500).

```bash
sudo nmap -sU -p 53,111,161,500,4500 10.10.10.10
```

---

## SMB Vulnerability Scan

```bash
nmap -p 445,139 --script smb-vuln* --script-args=unsafe=1 10.10.10.10
```

!!! warning "Watch out"
    `--script=vuln` and `smb-vuln*` with `unsafe=1` can crash vulnerable services. Fine for HTB — be cautious on real engagements.
