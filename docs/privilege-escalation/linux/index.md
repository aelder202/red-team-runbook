# Linux Privilege Escalation

!!! tip "Quick win order"
    1. `sudo -l` — misconfigured sudo is the most common Linux privesc
    2. SUID binaries: `find / -perm -4000 2>/dev/null` — check against GTFOBins
    3. Writable cron jobs: `cat /etc/cron* /etc/cron.d/*` and check script permissions
    4. Running as a service account? Check what the service binary does and if it's writable
    5. Check `/etc/passwd` for writable entries
    6. Kernel version: `uname -r` — only exploit if nothing else works, kernel exploits are noisy
