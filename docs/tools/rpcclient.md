# RPCClient — NetBIOS and SMB Enumeration Utility

## Overview

`rpcclient` is part of the **Samba suite**, and allows interaction with Windows systems using the SMB/RPC protocol stack. It's commonly used for **enumerating users, groups, domain trusts, and more**—even as a low-priv or unauthenticated user (null session).

It interacts with **MS-RPC (Microsoft Remote Procedure Call)** services, including SAMR (Security Account Manager Remote), LSA, and SRVSVC.

This makes it useful in:

- Pre-auth enumeration
    
- Credential brute forcing validation
    
- Domain reconnaissance
    
- SID/user/group enumeration
    
- Post-ex validation of user rights
    

---

## Syntax

```bash
rpcclient -U <user>%<password> <target>
```

Examples:

```bash
rpcclient -U "guest%" 10.10.10.10
rpcclient -U "john%Winter2023!" 10.10.10.10
rpcclient -N 10.10.10.10             # Null session
```

Once connected, you'll drop into an interactive shell where you can run `rpcclient` commands.

---

## Common Commands and Use Cases

### 1. Enumerate Domain Users

```bash
enumdomusers
```

Output:

```text
user:[Administrator] rid:[0x1f4]
user:[john] rid:[0x1f5]
```

To resolve a RID to a SID:

```bash
queryuser 0x1f4
```

---

### 2. Enumerate Domain Groups

```bash
enumdomgroups
```

Follow up with group info:

```bash
querygroup <RID>
```

---

### 3. SID Enumeration

You can enumerate known SIDs to resolve users:

```bash
lookupsids S-1-5-21-...-500
```

Or bruteforce SIDs for RID cycling:

```bash
for i in $(seq 500 550); do echo "S-1-5-21-XXXXXXX-XXXXXXX-XXXXXXX-$i" >> sids.txt; done
rpcclient -U "" <ip> -c "lookupsids $(cat sids.txt)"
```

---

### 4. Enumerate Share Information

```bash
netshareenum
```

List available shares, similar to `smbclient -L`.

---

### 5. Get Machine Info 

```bash
getdompwinfo       # Domain password policy
getdcname .        # Domain Controller name
gethostname        # NetBIOS name of host
```

---

### 6. Dump Password Policy

```bash
getdompwinfo
```

Example output:

```text
min password length: 7
password history length: 24
password properties: 0x00000000
```

---
### 7. Password Update
With the appropriate credentials, it may be possible to update another user's password:

```bash
setuserinfo2 MOLLY.SMITH 23 'Password1!'
```
**Note:** The `23` is the important tag. Reference [this](https://www.thehacker.recipes/ad/movement/dacl/forcechangepassword) article.

---

## Example Workflow (Unauthenticated Enumeration)

```bash
rpcclient -U "" 10.10.10.10
> enumdomusers
> enumdomgroups
> getdompwinfo
> netshareenum
> getdcname .
> queryuser 0x1f4
```

If null sessions are disabled, test with valid credentials:

```bash
rpcclient -U "lowpriv%Winter2023!" 10.10.10.10
```

---

## Integration with Other Tools

- Pair with `smbclient`, `enum4linux`, or `nmap` scripts
    
- Good alternative when `smbclient` fails or returns access denied
    
- Use `rpcclient` + `RID cycling` to discover hidden users even if no enumeration is allowed
    

---

## Summary: `rpcclient` Enumeration

| Task                | Command                       |
| ------------------- | ----------------------------- |
| Connect anonymously | `rpcclient -N <ip>`           |
| Connect with creds  | `rpcclient -U user%pass <ip>` |
| Enumerate users     | `enumdomusers`                |
| Enumerate groups    | `enumdomgroups`               |
| Get password policy | `getdompwinfo`                |
| Lookup SIDs         | `lookupsids <sid>`            |
| Enumerate shares    | `netshareenum`                |
| Get DC hostname     | `getdcname .`                 |
