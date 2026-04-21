# Subdomain & Parameter Fuzzing

!!! tip "Tip"
    For parameter fuzzing, `x8` is faster than ffuf for discovering hidden parameters in existing endpoints. For subdomain fuzzing, filter by response size — wildcard DNS returns 200 for everything.

!!! warning "Watch out"
    Virtual host fuzzing requires the `Host` header, not the URL. Use `ffuf -H "Host: FUZZ.example.com"` — changing the URL path won't work.

---

## Subdomain Enumeration

### subfinder

```sh
subfinder -d example.com
```

### amass

```sh
amass enum -passive -d example.com
```

- `-passive` → Runs passive enumeration to avoid triggering alerts.

### gobuster

```sh
gobuster dns -d example.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

### ffuf

```sh
ffuf -u 'http://example.com' -H 'Host: FUZZ.example.com' -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

- `-fc 301` → Filters out HTTP 301 responses.
- `-fs` → Filters responses by size.

---

## Parameter Fuzzing

### ffuf

```bash
ffuf -u "http://10.10.10.10/page.php?FUZZ=value" -w /usr/share/seclists/Fuzzing/special-chars.txt
```

### arjun

```bash
arjun -u http://10.10.10.10/page.php -w /usr/share/seclists/Fuzzing/special-chars.txt
```

- Automates parameter fuzzing for GET and POST requests.
- Supports JSON and XML-based APIs.
