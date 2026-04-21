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
ssh -D 1080 <user>@192.168.1.100
```

Add to `/etc/proxychains4.conf`:

```
socks5 127.0.0.1 1080
```

Route tools through the proxy:

```bash
proxychains nmap -sT -p445 10.4.50.215
proxychains smbclient -L //10.4.50.215/ -U <user>
```
