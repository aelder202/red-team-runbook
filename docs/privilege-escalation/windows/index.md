# Windows Privilege Escalation

!!! tip "Quick win order"
    1. `whoami /priv` — check for SeImpersonatePrivilege (Potato attacks), SeDebugPrivilege
    2. `net localgroup administrators` — already in admin group?
    3. Unquoted service paths: `wmic service get name,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\windows"`
    4. AlwaysInstallElevated: `reg query HKCU\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated`
    5. Stored credentials: `cmdkey /list`, check for saved RDP/WinRM credentials
    6. Run `winpeas.exe` for a comprehensive sweep — cross-reference findings manually
