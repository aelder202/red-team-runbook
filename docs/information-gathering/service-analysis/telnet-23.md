# Telnet (23)

!!! tip "Start here"
    Connect and check the banner: `telnet 10.10.10.10`. The banner often reveals the device type, OS, and version. Everything is cleartext — if you can capture traffic on the same segment, you get credentials for free.

---

## Enumeration

```bash
nmap -p 23 --script telnet-ntlm-info,telnet-encryption 10.10.10.10
```

---

## Connect

```bash
telnet 10.10.10.10
telnet 10.10.10.10 23
nc -nv 10.10.10.10 23
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt telnet://10.10.10.10
hydra -l admin -P /usr/share/wordlists/rockyou.txt telnet://10.10.10.10
```

Common default credentials by device type:

| Device | Username | Password |
|--------|----------|----------|
| Cisco IOS | admin | admin / cisco |
| Cisco IOS | | (blank) |
| Juniper | root | (blank) |
| Allied Telesis | manager | friend |
| Generic | admin | password / 1234 |

---

## Traffic Capture

If positioned on the same network segment, Telnet credentials are cleartext:

```bash
sudo tcpdump -i eth0 port 23 -A -w telnet.pcap
```

!!! tip "Real-world"
    Telnet on modern servers is almost always a misconfiguration or a forgotten legacy install. On network gear (routers, switches, industrial control systems), it's much more common and often the only management interface available. Default credentials are worth trying before brute force — most network gear ships with known defaults and they rarely get changed.
