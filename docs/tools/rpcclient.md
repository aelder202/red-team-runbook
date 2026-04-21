# RPCClient — SMB/RPC Enumeration

!!! tip "Tip"
    Null session: `rpcclient -U "" -N 10.10.10.10`. Useful commands: `enumdomusers` (user list), `queryuser <rid>` (user details), `enumdomgroups` (group list). RID cycling: `for i in $(seq 500 1100); do rpcclient -U "" -N 10.10.10.10 -c "queryuser $i" 2>/dev/null | grep "User Name"; done`.

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

Once connected, you'll drop into an interactive shell.

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

Resolve a known SID:

```bash
lookupsids S-1-5-21-...-500
```

Brute-force SIDs for RID cycling:

```bash
for i in $(seq 500 550); do echo "S-1-5-21-XXXXXXX-XXXXXXX-XXXXXXX-$i" >> sids.txt; done
rpcclient -U "" 10.10.10.10 -c "lookupsids $(cat sids.txt)"
```

---

### 4. Enumerate Share Information

```bash
netshareenum
```

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

With appropriate credentials, update another user's password:

```bash
setuserinfo2 MOLLY.SMITH 23 'Password1!'
```

The `23` value is the info level for password change (maps to `USER_INFO_23`).

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

