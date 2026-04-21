# User & Host Enumeration

!!! tip "Tip"
    On Linux, `cat /etc/passwd` and `id` tell you who you are and who else exists. On Windows, `whoami /priv` and `net user` are the first two commands to run. In AD environments, `net user /domain` gives domain users without any special tools.

## User Enumeration

### Linux

```bash
cat /etc/passwd
cut -d: -f1 /etc/passwd
getent passwd
who
w
users
```

### Windows

```cmd
net user
query user
whoami /priv
```

### Active Directory

```cmd
net user /domain
net user <username> /domain | findstr "Group"
```

```powershell
Get-ADUser -Filter *
Get-ADUser -Identity <username> -Properties *
Get-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName
```

---

## Host Enumeration

### Linux

```bash
hostname
uname -n
ip a
ifconfig -a
systemctl list-units --type=service
ps aux
```

### Windows

```cmd
hostname
echo %USERDOMAIN%
wmic product get name,version
netstat -ano
```

```powershell
Get-NetTCPConnection
```

---

## SMB Enumeration

```bash
smbclient -L //10.10.10.10 -N
nmap --script smb-enum-shares -p445 10.10.10.10
```

---

## LDAP Enumeration

```bash
ldapsearch -x -b "dc=example,dc=com"
ldapsearch -x -h <dc-ip> -b "dc=example,dc=com" "(objectClass=person)"
```
