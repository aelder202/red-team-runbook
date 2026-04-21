## tcpdump

Official Documentation: [tcpdump.1](https://www.tcpdump.org/manpages/tcpdump.1.html) 
Tutorial & Examples: [HackerTarget](https://hackertarget.com/tcpdump-examples/)

---
## Basic Capture on a Specific Interface and Port

```
sudo tcpdump -i tun0 port 80
```

### Common Options:

- `-w capture.pcap` → Save output to a file for later analysis.
    
- `-v` → Verbose output.
    
- `-vv` → More verbose output, including ASCII data.
    
- `icmp` → Filter ICMP packets only.
    
- `-n` → Do not resolve IP addresses to hostnames.

---

## Capturing GET Requests

```
sudo tcpdump -i eth0 -A 'tcp port 80 and (((ip[2:2] - ((ip[0]&0xf)<<2)) - ((tcp[12]&0xf0)>>2)) != 0)'
```

- The above filter captures HTTP **GET** requests on TCP port **80**.
    
- `-A` ensures ASCII text output is shown directly in the terminal.

---
## Filtering by TCP Flags

```
sudo tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-fin) != 0'
```

- Captures only **SYN** or **FIN** packets.
    
- Useful for detecting connection attempts and terminations.
    

---

## Advanced Filtering Examples

### Capture Only DNS Traffic

```
sudo tcpdump -i eth0 udp port 53
```

- Monitors DNS queries and responses.
    

### Capture HTTPS Traffic on a Specific Host

```
sudo tcpdump -i eth0 port 443 and host 192.168.1.10
```

### Capture All SSH Traffic

```
sudo tcpdump -i eth0 port 22
```

- Helpful for detecting unauthorized SSH access.

### Capture Packets from a Specific MAC Address

```
sudo tcpdump -i eth0 ether src 00:1A:2B:3C:4D:5E
```

---
## Saving and Analyzing Captures

### Save to a File for Offline Analysis

```
sudo tcpdump -i eth0 -w output.pcap
```

### Read a Saved Capture File

```
tcpdump -r output.pcap
```

### Analyze with Wireshark

```
tshark -r output.pcap
```

- `tshark` provides command-line packet analysis from Wireshark.