# Situational Awareness

!!! tip "Tip"
    Before running any priv-esc tooling, answer three questions: who am I, where am I, and who else is here? A minute of manual orientation prevents wasted scans and tells you what kind of escalation path is even possible.

The commands below are the first thing to run on any new shell — they're intentionally manual so you understand the environment before firing off `linpeas` or `winpeas`. See [Linux Local Enumeration](linux/local-enumeration.md) and [Windows Local Enumeration](windows/local-enumeration.md) for automated follow-up.

---

## Linux

### Who Am I

```bash
id
whoami
groups
sudo -l                                 # what can I run as root?
```

### Where Am I

```bash
hostname
uname -a
cat /etc/os-release
ip a
ss -tulnp                               # listening services
```

### Who Else Is Here

```bash
cat /etc/passwd | grep -v nologin       # accounts with shells
who
w                                       # currently logged-in users
last -a | head                          # recent logins
getent passwd                           # includes AD/LDAP users when nsswitch is configured
```

### What's Running

```bash
ps auxf
systemctl list-units --type=service --state=running
crontab -l                              # my cron jobs
cat /etc/crontab                        # system cron
ls -la /etc/cron.*
```

---

## Windows

### Who Am I

```cmd
whoami
whoami /all
whoami /priv
whoami /groups
```

### Where Am I

```cmd
hostname
systeminfo
ipconfig /all
netstat -ano
echo %USERDOMAIN%
echo %LOGONSERVER%
```

### Who Else Is Here

```cmd
net user
net localgroup
net localgroup Administrators
query user
```

### What's Running

```cmd
tasklist /v
sc query state= all
schtasks /query /fo LIST /v
wmic product get name,version
```

PowerShell equivalents:

```powershell
Get-Process
Get-Service | Where-Object {$_.Status -eq 'Running'}
Get-ScheduledTask | Where-Object State -eq Ready
Get-NetTCPConnection -State Listen
```

---

## Active Directory

Once you confirm you're domain-joined (via `echo %USERDOMAIN%` or `(Get-WmiObject Win32_ComputerSystem).Domain`), fall back to built-in `net` commands — no tools to upload, works from any user context:

```cmd
net user /domain                        # all domain users
net user <username> /domain             # user details, group membership
net group /domain                       # domain groups
net group "Domain Admins" /domain       # DA membership
net group "Enterprise Admins" /domain
net accounts /domain                    # password policy, lockout threshold
```

PowerShell (ActiveDirectory module, if available):

```powershell
Get-ADUser -Filter * -Properties LastLogonDate | Select Name,LastLogonDate
Get-ADUser -Identity <user> -Properties *
Get-ADGroupMember "Domain Admins"
Get-ADUser -Filter {ServicePrincipalName -ne "$null"} -Properties ServicePrincipalName
```

For full AD enumeration without relying on the AD module, see [Domain Enumeration](active-directory/domain-enumeration.md) and [BloodHound](../tools/bloodhound.md).

!!! tip "Real-world"
    `whoami /priv` on Windows is the single most valuable command after landing a shell. `SeImpersonatePrivilege`, `SeBackupPrivilege`, `SeAssignPrimaryToken`, or `SeLoadDriverPrivilege` each map to a concrete local-to-SYSTEM path — check [Privilege Abuse](windows/privilege-abuse.md) first before anything else.
