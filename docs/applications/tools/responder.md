## Basic Usage

!!! tip "Tip"
    Run Responder in analyze mode first (`-A`) to see what traffic is hitting your interface before poisoning — this avoids disrupting the network unnecessarily.

!!! warning "Watch out"
    Responder and Impacket's SMB server conflict on port 445. If you're running both, disable Responder's SMB (`--lm`) or stop one before starting the other.

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
