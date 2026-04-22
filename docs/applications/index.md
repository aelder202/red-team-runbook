# Web Application Testing

Web application testing follows a consistent pattern: fingerprint the stack, map the attack surface, probe authentication, then work through vulnerability classes systematically. Speed comes from knowing which checks matter for the technology you're looking at.

---

## Methodology

### 1. Fingerprint the Application

Identify the technology stack before testing anything — the right exploits depend on knowing what's running.

```bash
whatweb http://10.10.10.10
curl -I http://10.10.10.10          # response headers
```

Look for:
- Framework/CMS in headers (`X-Powered-By`, `Server`, cookies)
- Version disclosure in error pages or source comments
- Known CMS signatures (`/wp-login.php`, `/administrator`, `/gitea`)

See [Service Identification](enumeration/service-identification.md) for tool-assisted fingerprinting.

---

### 2. Map the Attack Surface

Enumerate directories, subdomains, and parameters before testing exploits. You can't test what you haven't found.

**Directory fuzzing:**

```bash
feroxbuster -u http://10.10.10.10 -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -t 10 --filter-status 403,404
```

**Subdomain enumeration:**

```bash
ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://10.10.10.10 -H "Host: FUZZ.example.com" -fc 301,302
```

See [Directory & Page Fuzzing](enumeration/directory-page-fuzzing.md) and [Subdomain & Parameter Fuzzing](enumeration/subdomain-parameter-fuzzing.md).

!!! tip "Real-world"
    Find the admin panel before testing anything else — it's usually the highest-value target and often has weaker controls than the public-facing app.

---

### 3. Test Authentication

Weak authentication is the most common path to initial access on web applications.

- Default credentials (`admin:admin`, `admin:password`) — check before brute-forcing
- Username enumeration via error message or timing differences
- JWT tampering — `alg: none`, weak secret, key confusion
- Session token predictability or fixation

```bash
hydra -L users.txt -P /usr/share/wordlists/rockyou.txt 10.10.10.10 http-post-form "/login:username=^USER^&password=^PASS^:F=incorrect"
```

See [Credential Brute-Forcing](auth/credential-brute-forcing.md), [JWT Attacks](auth/jwt-attacks.md), and [Session Hijacking](auth/session-hijacking.md).

---

### 4. Test for Common Vulnerabilities

Work through vulnerability classes in order of likelihood for the technology stack. Don't spray every payload everywhere — read the app first.

| Vulnerability | First probe |
|---|---|
| SQL Injection | `'`, `" OR 1=1--`, `sqlmap -u URL --dbs` |
| LFI | `?page=../../../etc/passwd` |
| SSTI | `{{7*7}}`, `${7*7}`, `<%= 7*7 %>` |
| XSS | `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` |
| SSRF | Point a URL parameter at `http://127.0.0.1` or your listener |
| Command Injection | `; id`, `| whoami`, `$(id)` |
| XXE | Inject `<!DOCTYPE` into XML input fields |
| IDOR | Increment/alter IDs in requests to access other users' data |
| File Upload | Upload `.php`, `.aspx`, or bypass with double extensions |

See the [Exploits](exploits/command-injection.md) sub-pages for full technique detail.

!!! tip "Real-world"
    Burp Suite Repeater is worth setting up early — you'll re-send modified requests constantly. Map the app passively through the proxy before running any active scans.

---

### 5. Application-Specific Testing

When you identify a known application, switch to targeted techniques.

| Application | Entry point |
|---|---|
| WordPress | `/wp-login.php`, `xmlrpc.php`, plugin CVEs via `wpscan` |
| Gitea | `/explore/repos`, SQLite hash extraction, webhook abuse |
| WebDAV | `PUT` method enabled, upload web shell via `cadaver` |

See [WordPress](app-enumeration/wordpress.md), [Gitea](app-enumeration/gitea.md), and [WebDAV](app-enumeration/webdav.md).
