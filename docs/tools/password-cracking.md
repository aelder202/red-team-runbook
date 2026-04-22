# Password Cracking

!!! tip ""
    Identify the hash type before cracking — `hashid <hash>` or paste into `hash-identifier`. Hashcat mode numbers must be exact; a wrong mode silently fails. Start with `rockyou.txt + best64.rule` before reaching for bigger wordlists or longer masks.

---

## Identify Hash Type

```bash
hashid '$6$salt$hash...'
hash-identifier
```

Common formats:

| Prefix / Format | Type | Hashcat Mode |
|---|---|---|
| 32 hex chars | NTLM | 1000 |
| `$1$` | MD5crypt | 500 |
| `$2a$`, `$2b$` | bcrypt | 3200 |
| `$5$` | SHA-256crypt | 7400 |
| `$6$` | SHA-512crypt | 1800 |
| `$krb5tgs$23$` | Kerberoast (RC4) | 13100 |
| `$krb5asrep$23$` | AS-REP Roast | 18200 |
| `$DCC2$` | Domain Cached Credentials 2 | 2100 |
| `USERNAME::DOMAIN:...` | NTLMv2 (Responder) | 5600 |
| `$apr1$` | Apache MD5 | 1600 |

---

## Hashcat

### Basic Wordlist Attack

```bash
hashcat -m <mode> hashes.txt /usr/share/wordlists/rockyou.txt
```

### Wordlist + Rules (Best Starting Point)

```bash
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/OneRuleToRuleThemAll.rule
```

### Mask Attack (Pattern-Based)

```bash
# 8 chars: uppercase + 6 lowercase + 2 digits  (e.g., Password12)
hashcat -m 1000 hashes.txt -a 3 ?u?l?l?l?l?l?d?d

# Corporate pattern: 6-char word + 4-digit year
hashcat -m 1000 hashes.txt -a 3 ?l?l?l?l?l?l?d?d?d?d
```

| Mask | Character Set |
|---|---|
| `?l` | Lowercase a-z |
| `?u` | Uppercase A-Z |
| `?d` | Digits 0-9 |
| `?s` | Symbols |
| `?a` | All printable |

### Combinator Attack

```bash
hashcat -m 1000 hashes.txt -a 1 wordlist1.txt wordlist2.txt
```

### Resume a Session

```bash
hashcat --session crackjob -m 1000 hashes.txt rockyou.txt
hashcat --session crackjob --restore
```

---

## John the Ripper

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
john --format=NT --wordlist=rockyou.txt hashes.txt
john --show hashes.txt        # display cracked results
```

---

## Wordlist Generation

### CeWL — crawl a target and generate a custom wordlist

Useful when the target likely has a custom password policy (company name, product names):

```bash
cewl http://10.10.10.10 -d 3 -m 5 -o cewl-wordlist.txt
hashcat -m 1000 hashes.txt cewl-wordlist.txt -r best64.rule
```

### Crunch — pattern-based generation

```bash
crunch 8 10 abcdefghijklmnopqrstuvwxyz0123456789 -o custom.txt
```

---

## Linux /etc/shadow

```bash
unshadow /etc/passwd /etc/shadow > combined.txt
john combined.txt --wordlist=/usr/share/wordlists/rockyou.txt
hashcat -m 1800 combined.txt rockyou.txt     # SHA-512crypt
```
