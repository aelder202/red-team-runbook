# Directory & Page Fuzzing

!!! tip "Wordlist selection"
    Start with `raft-medium-directories.txt` for general discovery. Use `common.txt` if you need speed over coverage. `directory-list-2.3-big.txt` only when you've confirmed there's something worth finding — it's slow. For API endpoints, use `api/api-endpoints.txt` from SecLists.

!!! warning "Watch out"
    Always filter 404s (`--filter-status 404` / `-fc 404`) and the default page size if the app returns 200 for everything. Filter by response size with `--filter-size <n>` (feroxbuster) or `-fs <n>` (ffuf) when the app returns the same "not found" body for every miss.

---

## feroxbuster

The fastest and most ergonomic tool for general directory busting — recursion, auto-filtering, and progress indicators out of the box.

```bash
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -x php,html,txt --filter-status 404
```

Recursive enumeration with depth limit:

```bash
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/common.txt -d 3
```

Silent mode (pipe-friendly output):

```bash
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/common.txt -q --silent
```

---

## ffuf

Use ffuf when you need fine-grained control over headers, POST bodies, or custom `FUZZ` placement (paths, parameters, vhosts). For plain directory discovery, feroxbuster is faster.

```bash
ffuf -u http://10.10.10.10/FUZZ -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -fc 404
```

Find admin panels:

```bash
ffuf -u http://10.10.10.10/FUZZ -w /usr/share/seclists/Discovery/Web-Content/admin-panels.txt -fc 404
```

Find backup files:

```bash
ffuf -u http://10.10.10.10/FUZZ -w /usr/share/seclists/Discovery/Web-Content/backup-files.txt -fc 404
```

Filter by response size when the app returns 200 for everything:

```bash
ffuf -u http://10.10.10.10/FUZZ -w wordlist.txt -fs 1234
```

---

## gobuster

Legacy but still widely installed. Useful as a fallback when feroxbuster and ffuf aren't available.

```bash
gobuster dir -u http://10.10.10.10 -w /usr/share/wordlists/dirb/common.txt -x php,html,txt -b 404 -q
```

Recursive directory enumeration:

```bash
gobuster dir -u http://10.10.10.10 -w /usr/share/wordlists/dirb/common.txt -r
```

---

## dirsearch

```bash
dirsearch -u http://10.10.10.10 -x 403,404
```
