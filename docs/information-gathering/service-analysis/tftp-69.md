```table-of-contents
```
**Trivial File Transfer Protocol (TFTP)** is a simplified, unsecured file transfer protocol that operates over **UDP port 69**. Unlike FTP, TFTP lacks authentication and encryption, making it **vulnerable to unauthorized file retrieval, modification, and code execution**. TFTP is commonly used in network booting (PXE), firmware updates, and device configurations.

## Common Attack Vectors

- **Anonymous File Retrieval:** TFTP often allows unrestricted file access, exposing configuration files.
- **Insecure File Uploads:** If write access is enabled, an attacker can **upload malicious firmware or scripts**.
- **Lack of Authentication:** No built-in authentication means **anyone** can interact with the server.
- **Network Device Exploitation:** Used in **PXE booting**, making **MITM attacks** feasible.

**Bookmarks:**
https://tools.kali.org/information-gathering/atftp  
https://tools.kali.org/information-gathering/tftp
## Enumeration
### Banner Grabbing
#### Automatic Enumeration
```bash
atftp --get --remote-file <filename> --local-file <filename> <target-ip>
```

Common files to target:
```bash
running-config
startup-config
passwd
shadow
bootloader.cfg
```
#### Nmap
```bash
nmap -sU -p 69 --script tftp-enum <target-ip>
```

Afterwards, check if the service is available with Netcat:
```bash
nc -vnzu <target-ip> 69
```

## Check Anonymous Read/Write Access
Unlike FTP, TFTP does not require authentication, making it high-risk if misconfigured.

Python script to fetch common configuration files:
```python
#!/usr/bin/python3
import os

target = "<target-ip>"
wordlist = ["config.cfg", "startup-config", "router.conf", "network.txt", "backup.img"]

for filename in wordlist:
    os.system(f"tftp {target} -c get {filename}")
```

If you can download config files, look for:

- Stored passwords (`username = admin, password = cisco`)
- SNMP strings (`community = public`)
- Device IPs (for lateral movement)
- Backup images (firmware analysis)

Commonly targeted files:

- `config`
- `router.cfg`
- `running-config`
- `startup-config`
- `passwords.txt`
- `backup.cfg`
## Write Access Privilege Escalation
If the TFTP server allows file uploads, you may be able to overwrite configuration files or deploy malicious scripts, such as `.php` reverse shells, to obtain a shell.

Reference: [[FTP (21)#Exploiting Misconfigurations]]

## Lateral Movement
If the TFTP server is used for PXE booting, it may contain disk images.

Download the boot files:
```
tftp> get pxelinux.0
tftp> get boot.cfg
```

If a PXE boot file is writable, you could replace it with a malicious script to obtain a shell:
```bash
tftp <target-ip>
tftp> put malicious_pxeboot.efi
```
On reboot, devices will execute attacker-controlled boot images.