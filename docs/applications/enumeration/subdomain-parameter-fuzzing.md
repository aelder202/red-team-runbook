Finding **subdomains** and **hidden parameters** in a web application can lead to **additional attack surfaces**.

🔗 references: [OWASP Amass](https://github.com/OWASP/Amass)

## Subdomain Enumeration

### subfinder

```sh
subfinder -d $URL
```

### amass

```sh
amass enum -passive -d $URL
```

- `-passive` → Runs passive enumeration to avoid triggering alerts.
### gobuster

```sh
gobuster dns --do $URL -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

### ffuf

```sh
ffuf -u 'http://target.com' -H 'Host: FUZZ.target.com' -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

- `-fc 301` → Filters out HTTP 301 responses.
- `-fs` → Filters responses by size.
## parameter fuzzing

### ffuf

```
ffuf -u "http://<target-ip>/page.php?FUZZ=value" -w /usr/share/seclists/Fuzzing/special-chars.txt
```

### arjun

```
arjun -u http://<target-ip>/page.php -w /usr/share/seclists/Fuzzing/special-chars.txt
```

- Automates parameter fuzzing for GET and POST requests.
- Supports JSON and XML-based APIs.