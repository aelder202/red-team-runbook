Fingerprinting web applications involves analyzing headers, technology stacks, and version numbers to identify potential vulnerabilities. This is useful for detecting outdated software, misconfigurations, or missing security headers.

## Gathering Server Headers

Server headers provide insights into the web server, application frameworks, and security mechanisms in place.

### Using Curl
```sh
curl -s -I $URL
```

- `-s`: Silent mode (hides progress)
    
- `-I`: Fetches headers only
    

### Using Netcat
```sh
nc -v $IP 80 HEAD / HTTP/1.1 Host: $IP
```

### Using WhatWeb
```sh
whatweb -a 3 $URL
```

- `-a 3`: Aggressive scanning mode

### Using Wappalyzer

[Wappalyzer](https://www.wappalyzer.com/) is a browser extension and CLI tool for detecting web technologies.
```sh
wappalyzer-cli https://target.com
```

## Identifying Web Server Versions

### Using Nmap

```sh
nmap -sV -p 80,443 $IP
```

- `-sV`: Service version detection

- `-p`: Specify common web ports


To target a broader range:

```sh
nmap -p- -sV $IP
```

### Using Nikto

```sh
nikto -h $URL
```

- Scans for web vulnerabilities and security misconfigurations
## Security Headers and SSL/TLS

Security headers help protect against various attacks, including cross-site scripting (XSS) and clickjacking.

### Checking Security Headers

[SecurityHeaders](https://securityheaders.com/) provides an analysis of missing HTTP headers.

Alternatively, use Curl:
```sh
curl -s -I $URL | grep -E "Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options|Content-Security-Policy"
```

### SSL/TLS Analysis

[Qualys SSL Labs](https://www.ssllabs.com/ssltest/) evaluates a website's SSL/TLS configuration.

```sh
sslscan $IP
```
or
```sh
openssl s_client -connect $IP:443
```