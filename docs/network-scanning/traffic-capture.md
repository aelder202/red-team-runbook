# Traffic Capture

!!! tip "Tip"
    Always specify an interface explicitly (`-i tun0` or `-i eth0`) — defaulting to `any` on a busy network produces unmanageable output. Use `-w capture.pcap` to write to disk and analyze offline with Wireshark or `tshark`.

## Quick Interface Triage

When you're not sure which interface has traffic, watch all of them briefly with MAC addresses visible:

```bash
sudo tcpdump -i any -nn -e -c 50
```

`-nn` skips DNS/port name resolution, `-e` prints link-layer headers (useful for spotting unexpected MAC sources on a segment).

---

## tcpdump

### Basic Capture on a Specific Interface and Port

```bash
sudo tcpdump -i tun0 port 80
```

Common options:

- `-w capture.pcap` — Save output to a file for later analysis
- `-v` — Verbose output
- `-vv` — More verbose output, including ASCII data
- `icmp` — Filter ICMP packets only
- `-n` — Do not resolve IP addresses to hostnames

---

### Capturing GET Requests

```bash
sudo tcpdump -i eth0 -A 'tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)'
```

---

### Filtering by TCP Flags

```bash
sudo tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-fin) != 0'
```

---

### Capture Only DNS Traffic

```bash
sudo tcpdump -i eth0 udp port 53
```

### Capture HTTPS Traffic on a Specific Host

```bash
sudo tcpdump -i eth0 port 443 and host 192.168.1.10
```

### Capture All SSH Traffic

```bash
sudo tcpdump -i eth0 port 22
```

### Capture Packets from a Specific MAC Address

```bash
sudo tcpdump -i eth0 ether src 00:1A:2B:3C:4D:5E
```

---

## Saving and Analyzing Captures

```bash
sudo tcpdump -i eth0 -w output.pcap
tcpdump -r output.pcap
tshark -r output.pcap
```

---

## tshark Display Filters

`tshark` uses the same display filter syntax as Wireshark — more expressive than tcpdump BPF filters. Read a pcap and extract only what matters:

```bash
# All HTTP requests with URI
tshark -r capture.pcap -Y 'http.request' -T fields -e ip.src -e http.host -e http.request.uri

# DNS queries (names only)
tshark -r capture.pcap -Y 'dns.qry.name' -T fields -e dns.qry.name | sort -u

# Extract credentials in HTTP Basic / POST bodies
tshark -r capture.pcap -Y 'http.authorization or http.request.method == "POST"' -V

# NTLMSSP handshakes (challenge/response pairs for cracking)
tshark -r capture.pcap -Y 'ntlmssp'

# Kerberos AS-REQ / AS-REP (look for pre-auth disabled users)
tshark -r capture.pcap -Y 'kerberos.msg_type == 10 or kerberos.msg_type == 11'
```

Live capture with a display filter:

```bash
sudo tshark -i eth0 -Y 'http.request' -T fields -e http.host -e http.request.uri
```

!!! tip "Real-world"
    On internal engagements, a 5-minute `tshark` capture on the user VLAN often yields cleartext creds (LDAP binds, HTTP Basic, old SNMP community strings) before you've run a single nmap scan. Pair with Responder for LLMNR/NBT-NS poisoning when passive listening isn't enough.
