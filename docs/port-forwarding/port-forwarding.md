# Port Forwarding

!!! tip "Tip"
    SSH local port forward: `ssh -L 8080:internal-host:80 pivot@10.10.10.10` — makes `internal-host:80` accessible at `localhost:8080` on your machine. Remote forward: `ssh -R 4444:localhost:4444 pivot@10.10.10.10` — routes target's port back to you.

---

## Socat Port Forward

Forward traffic through a compromised pivot host to an internal target:

```bash
# On the compromised pivot (CONFLUENCE01)
socat TCP-LISTEN:2222,fork TCP:10.4.189.215:22
```

```bash
# On attacker (Kali) — connects through pivot to internal SSH
ssh database_admin@192.168.189.63 -p2222
```

---

## SSH Local Port Forwarding

```bash
ssh -L 8080:10.4.50.215:80 <user>@192.168.1.100
```

Access the internal web server at `http://localhost:8080/`.

---

## SSH Dynamic Port Forwarding (SOCKS Proxy)

```bash
ssh -D 1080 <user>@10.10.10.10
```

Add to `/etc/proxychains4.conf`:

```
socks5 127.0.0.1 1080
```

Route tools through the proxy:

```bash
proxychains nmap -sT -p445 10.10.10.20
proxychains smbclient -L //10.10.10.20/ -U <user>
```

---

## sshuttle (VPN-over-SSH)

No agent needed on the target — only SSH access. `sshuttle` transparently tunnels traffic for specified subnets through the SSH session. Tools run natively (no proxychains).

```bash
sshuttle -r <user>@10.10.10.10 10.10.20.0/24

# Multiple subnets + include DNS
sshuttle -r <user>@10.10.10.10 10.10.20.0/24 10.10.30.0/24 --dns
```

!!! tip "Real-world"
    `sshuttle` is the fastest setup when you have SSH — no need to drop binaries on the pivot. Uses iptables on attacker side to redirect traffic, so expect `sudo` prompt. Works great for quick internal network access on engagements where you've obtained SSH creds.
