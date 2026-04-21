!!! tip "Tip"
    On Linux, `cat /etc/passwd` and `id` tell you who you are and who else exists. On Windows, `whoami /priv` and `net user` are the first two commands to run. In AD environments, `net user /domain` gives domain users without any special tools.

## User Enumeration

### local user enumeration on linux

```
cat /etc/passwd  # List all users
cut -d: -f1 /etc/passwd  # Extract usernames
getent passwd  # Query system user database
```

Check currently logged-in users:

```
who
w
users
```

### local user enumeration on windows

Check local users:

```
net user
```

List logged-in users:

```
query user
```

Check if the current user has admin privileges:

```
whoami /priv
```

### active directory user enumeration

List all domain users:

```
net user /domain
Get-ADUser -Filter *
```

Query specific user details:

```
net user <username> /domain
Get-ADUser -Identity <username> -Properties *
```

List groups a user is a member of:

```
net user <username> /domain | findstr "Group"
```

Find users with SPN set (Kerberoastable accounts):

```
Get-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName
```

---
## host enumeration

### linux host enumeration

Find system hostname:

```
hostname
uname -n
```

List network interfaces:

```
ip a
ifconfig -a
```

Find running services:

```
systemctl list-units --type=service
ps aux
```

### windows host enumeration

Find hostname and domain:

```
hostname
echo %USERDOMAIN%
```

List installed programs:

```
wmic product get name,version
```

List active network connections: ^m1bu5e

```
netstat -ano
Get-NetTCPConnection
```

### smb enumeration

Check for open SMB shares:

```
smbclient -L //<target-ip> -N
```

Enumerate SMB shares using Nmap:

```
nmap --script smb-enum-shares -p445 <target-ip>
```

### ldap enumeration

Retrieve domain details via LDAP:

```
ldapsearch -x -b "dc=example,dc=com"
```

Find AD users via LDAP:

```
ldapsearch -x -h <dc-ip> -b "dc=example,dc=com" "(objectClass=person)"
```
