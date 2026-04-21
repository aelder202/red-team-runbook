## References
    
- [Socat: Linux Port Redirection](http://www.dest-unreach.org/socat/)
    
- [SSH Tunneling: Practical Examples](https://linuxize.com/post/how-to-setup-ssh-tunneling/)
    
- [NAT Traversal Techniques](https://www.exploit-db.com/papers/13006)
    

---

!!! tip "Tip"
    SSH local port forward: `ssh -L 8080:internal-host:80 pivot@target` — makes `internal-host:80` accessible at `localhost:8080` on your machine. Remote forward: `ssh -R 4444:localhost:4444 pivot@target` — routes target's port back to you.

---
## Port Forwarding with Socat

Socat is a flexible command-line utility for bidirectional data transfer. It can be used to create simple or complex port forwarding scenarios.

### Scenario: Forwarding SSH Access Through an Internal Host

1. Compromise CONFLUENCE01 (a host with access to an internal network).
    
2. Use Socat to forward traffic from the attacker to an internal PGDATABASE01 host.
    

#### On the Compromised Machine (CONFLUENCE01)

```bash
socat TCP-LISTEN:2222,fork TCP:10.4.189.215:22
```

- TCP-LISTEN:2222 → Listens for connections on port 2222.
    
- fork → Allows multiple connections.
    
- TCP:10.4.189.215:22 → Forwards traffic to the internal host on port 22 (SSH).
    

#### On the Attacker’s Machine (Kali)

```bash
ssh database_admin@192.168.189.63 -p2222
```

- Connects to CONFLUENCE01 on port 2222.
    
- Traffic is forwarded to PGDATABASE01's SSH service.
    

---
## Port Forwarding with SSH

SSH port forwarding (also known as SSH tunneling) is a secure way to forward network traffic.

### Local Port Forwarding

Forwards a local port to a remote destination through an SSH connection.

```bash
ssh -L 8080:10.4.50.215:80 user@192.168.1.100
```

- -L 8080:10.4.50.215:80 → Forwards local port 8080 to the internal web server (port 80).
    
- user@192.168.1.100 → SSH authentication to an intermediate host.
    

Now, the attacker can access [http://localhost:8080/](http://localhost:8080/) to interact with the internal server.

---
## Using SSH for Dynamic Port Forwarding

Dynamic port forwarding creates a SOCKS proxy that allows the attacker to route traffic through an intermediate host.

### Setting Up a SOCKS Proxy

```bash
ssh -D 1080 user@192.168.1.100
```

- -D 1080 → Creates a SOCKS5 proxy on port 1080.
    
- Traffic is relayed through the SSH tunnel.
    

### Using ProxyChains with the SOCKS Proxy

Modify /etc/proxychains4.conf:

```
socks5 127.0.0.1 1080
```

Now, tools like `nmap` and `smbclient` can be routed through the compromised host:

```bash
proxychains nmap -sT -p445 10.4.50.215
proxychains smbclient -L //10.4.50.215/ -U user
```

This allows access to internal network services.