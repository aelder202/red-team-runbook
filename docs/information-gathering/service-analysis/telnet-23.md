# Telnet (23)

!!! tip "Start here"
    Connect and check the banner: `telnet $IP`. Telnet provides no transport encryption, so credentials and session content are observable to a suitably positioned network monitor.

---

## Enumeration

```bash
nmap -p 23 --script telnet-ntlm-info,telnet-encryption $IP
```

---

## Connect

```bash
telnet $IP
telnet $IP 23
nc -nv $IP 23
```

---

## Brute Force

```bash
hydra -L users.txt -P passwords.txt telnet://$IP
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
sudo tcpdump -i eth0 -nn -A 'tcp port 23'       # inspect printable payloads live
sudo tcpdump -i eth0 -nn -w telnet.pcap 'tcp port 23'  # save a packet capture
```
