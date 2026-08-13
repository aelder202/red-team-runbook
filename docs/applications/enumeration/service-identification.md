# Service Identification

!!! tip "Tip"
    Response headers often reveal framework and version: `X-Powered-By`, `Server`, `X-Generator`. Also check error pages, frameworks leak version info in stack traces.

!!! warning "Watch out"
    Don't rely solely on HTTP headers for fingerprinting, they can be spoofed or stripped. Confirm with behavior-based checks (error message format, cookie names, response timing).

---

## Gathering Server Headers

### curl

```sh
curl -s -I http://$IP
```

- `-s`: Silent mode (hides progress)
- `-I`: Fetches headers only

### Netcat

```sh
nc -v $IP 80
HEAD / HTTP/1.1
Host: $IP
```

### WhatWeb

```sh
whatweb -a 3 http://$IP
```

- `-a 3`: Aggressive scanning mode

### httpx (tech detection)

```sh
httpx -u https://$DOMAIN -tech-detect -title -status-code -server
```

Run against a list of targets piped from `subfinder` or a file:

```sh
subfinder -d $DOMAIN -silent | httpx -tech-detect -title -status-code
```

### webanalyze

```sh
webanalyze -host https://$DOMAIN -crawl 2
```

---

## Identifying Web Server Versions

### Nmap

```sh
nmap -sV -p 80,443 $IP
```

Broader port range:

```sh
nmap -p- -sV $IP
```

### Nikto

```sh
nikto -h http://$IP
```

---

## Security Headers and SSL/TLS

### Checking Security Headers

```sh
curl -s -I http://$IP | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Content-Security-Policy"
```

### SSL/TLS Analysis

```sh
sslscan $IP
```

```sh
openssl s_client -connect $IP:443
```
