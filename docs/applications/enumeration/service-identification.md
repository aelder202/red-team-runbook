# Service Identification

!!! tip "Tip"
    Response headers often reveal framework and version: `X-Powered-By`, `Server`, `X-Generator`. Also check error pages — frameworks leak version info in stack traces.

!!! warning "Watch out"
    Don't rely solely on HTTP headers for fingerprinting — they can be spoofed or stripped. Confirm with behavior-based checks (error message format, cookie names, response timing).

---

## Gathering Server Headers

### curl

```sh
curl -s -I http://10.10.10.10
```

- `-s`: Silent mode (hides progress)
- `-I`: Fetches headers only

### Netcat

```sh
nc -v 10.10.10.10 80
HEAD / HTTP/1.1
Host: 10.10.10.10
```

### WhatWeb

```sh
whatweb -a 3 http://10.10.10.10
```

- `-a 3`: Aggressive scanning mode

### httpx (tech detection)

```sh
httpx -u https://example.com -tech-detect -title -status-code -server
```

Run against a list of targets piped from `subfinder` or a file:

```sh
subfinder -d example.com -silent | httpx -tech-detect -title -status-code
```

### webanalyze

```sh
webanalyze -host https://example.com -crawl 2
```

---

## Identifying Web Server Versions

### Nmap

```sh
nmap -sV -p 80,443 10.10.10.10
```

Broader port range:

```sh
nmap -p- -sV 10.10.10.10
```

### Nikto

```sh
nikto -h http://10.10.10.10
```

---

## Security Headers and SSL/TLS

### Checking Security Headers

```sh
curl -s -I http://10.10.10.10 | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Content-Security-Policy"
```

### SSL/TLS Analysis

```sh
sslscan 10.10.10.10
```

```sh
openssl s_client -connect 10.10.10.10:443
```
