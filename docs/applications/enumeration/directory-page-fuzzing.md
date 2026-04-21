# Directory & Page Fuzzing

!!! tip "Wordlist selection"
    Start with `raft-medium-directories.txt` for general discovery. Use `common.txt` if you need speed over coverage. `directory-list-2.3-big.txt` only when you've confirmed there's something worth finding — it's slow. For API endpoints, use `api/api-endpoints.txt` from SecLists.

!!! warning "Watch out"
    Always set `--hc 404` (or equivalent) to hide 404s. Also filter by response size if the app returns 200 for everything — `--fs <size>` in ffuf.

---

## dirsearch

```bash
dirsearch -u http://10.10.10.10 -x 403,404
```

---

## wfuzz

```bash
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt --hc 404 http://10.10.10.10/FUZZ
```

### Additional wfuzz filters

Find admin panels:

```bash
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/admin-panels.txt --hc 404 http://10.10.10.10/FUZZ
```

Find backup files:

```bash
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/backup-files.txt --hc 404 http://10.10.10.10/FUZZ
```

---

## gobuster

```bash
gobuster dir -e -u http://10.10.10.10 -w /usr/share/wordlists/dirb/common.txt -x php,html,txt --status-codes-blacklist "404" -q
```

### Additional gobuster scans

Recursive directory enumeration:

```bash
gobuster dir -u http://10.10.10.10 -w /usr/share/wordlists/dirb/common.txt -r
```

Virtual host fuzzing:

```bash
gobuster vhost -u http://10.10.10.10 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

---

## feroxbuster

```bash
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/big.txt -t 10 --filter-status 403,404
```

### Additional feroxbuster usage

Recursive enumeration with depth limit:

```bash
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/common.txt -d 3
```

Silent mode for automation:

```bash
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/common.txt -q
```
