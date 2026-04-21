# Traffic Capture

!!! tip "Tip"
    Always specify an interface explicitly (`-i tun0` or `-i eth0`) — defaulting to `any` on a busy network produces unmanageable output. Use `-w capture.pcap` to write to disk and analyze offline with Wireshark or `tshark`.

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
