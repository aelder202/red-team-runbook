## dirsearch

!!! tip "Wordlist selection"
    Start with `raft-medium-directories.txt` for general discovery. Use `common.txt` if you need speed over coverage. `directory-list-2.3-big.txt` only when you've confirmed there's something worth finding — it's slow. For API endpoints, use `api/api-endpoints.txt` from SecLists.

!!! warning "Watch out"
    Always set `--hc 404` (or equivalent) to hide 404s. Also filter by response size if the app returns 200 for everything — `--fs <size>` in ffuf.

```bash
dirsearch -u $URL -x 403,404
```
* `-u $URL` to provide URL
* `-x 403,404` to exclude 403,404 responses
## wfuzz

```
wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt --hc 404 $URL/FUZZ
```

- `-c` → Enables color in the output for easier readability.

- `-z file,<file>` → Specifies a wordlist.

- `--hc 404` → Hides results with HTTP status code 404. Multiple codes can be added: `404,403,500`.

- `--sc 200` → Shows only HTTP status code 200 responses (useful for filtering valid pages).
### additional wfuzz filters

- Find admin panels:

    ```
    wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/admin-panels.txt --hc 404 $URL/FUZZ
    ```

- Find backup files:

    ```
    wfuzz -c -z file,/usr/share/seclists/Discovery/Web-Content/backup-files.txt --hc 404 $URL/FUZZ
    ```

## gobuster

```
gobuster dir -e -u $URL -w /usr/share/wordlists/dirb/common.txt -x php,html,txt --status-codes-blacklist "404" -q
```

- `dir` → Performs directory brute-forcing.
    
- `-e` → Expanded mode (prints full URL).
    
- `-x php,html,txt` → Specifies file extensions to append to each word in the wordlist (e.g., `.php`, `.html`, `.txt`).
    
- `--status-codes-blacklist "404"` → Excludes responses with status code 404.
    
- `-q` → Suppresses progress output, making results cleaner.
    
- `-b 403,500` → Excludes additional status codes from the results.
    

### additional gobuster scans

- Recursive directory enumeration:
    
    ```
    gobuster dir -u $URL -w /usr/share/wordlists/dirb/common.txt -r
    ```
    
- Virtual host fuzzing:
    
    ```
    gobuster vhost -u $URL -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
    ```
    

## feroxbuster

```
feroxbuster -u $URL -w /usr/share/seclists/Discovery/Web-Content/big.txt -t 10 -filter-status 403,404
```

- `-x php,txt,html` → Look for specific file extensions.
    
- `-r` → Follow redirects.
    
- `-t 10` → Set the number of threads to use (increase for faster scanning).
    
- `-n` → Don't print the banner for a cleaner output.
    
- `-d 2` → Set recursion depth (useful for deep enumeration of nested directories).
    

### additional feroxbuster usage

- Recursive enumeration with depth limit:
    
    ```
    feroxbuster -u $URL -w /usr/share/seclists/Discovery/Web-Content/common.txt -d 3
    ```
    
- Silent mode for automation:
    
    ```
    feroxbuster -u $URL -w /usr/share/seclists/Discovery/Web-Content/common.txt -q
    ```
