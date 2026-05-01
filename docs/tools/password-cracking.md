# Password Cracking

## Identify Hash Type

```bash
nth -t '$6$salt$hash...'                       # name-that-hash, ranked output
haiti '$6$salt$hash...'
hashcat --identify '$6$salt$hash...'           # hashcat 6.2.6+ native identifier
```

When two tools disagree, look up the exact format with hashcat's example database and pattern-match against your hash:

```bash
hashcat --example-hashes | less                # full reference
hashcat --example-hashes -m 18200              # show example for one mode
hashcat --example-hashes | grep -B2 -A2 -i kerberos
```

Hashcat's [example hashes page](https://hashcat.net/wiki/doku.php?id=example_hashes) is the authoritative mode list. Common formats:

| Prefix / Format | Type | Hashcat Mode |
|---|---|---|
| 32 hex chars | NTLM | 1000 |
| `$1$` | MD5crypt | 500 |
| `$2a$`, `$2b$`, `$2y$` | bcrypt | 3200 |
| `$5$` | SHA-256crypt | 7400 |
| `$6$` | SHA-512crypt | 1800 |
| `$y$` | yescrypt (modern Linux) | 30900 |
| `$krb5tgs$23$` | Kerberoast (RC4) | 13100 |
| `$krb5tgs$18$` | Kerberoast (AES-256) | 19700 |
| `$krb5asrep$23$` | AS-REP Roast | 18200 |
| `$DCC2$` | Domain Cached Credentials 2 | 2100 |
| `USERNAME::DOMAIN:...` | NetNTLMv2 (Responder) | 5600 |
| `$NETNTLM$` | NetNTLMv1 | 5500 |
| `$apr1$` | Apache MD5 | 1600 |
| `$pbkdf2-sha256$` | PBKDF2-HMAC-SHA256 | 10900 |
| `$argon2id$` | Argon2 | 34000 |

---

## Extract Hashes from Files (`*2john`)

John ships a family of converters that pull crackable hashes out of password-protected files. They live in `/usr/share/john/` (or `/opt/john/run/` for a source build) and the output is John-format — strip the leading `filename:` to feed it into hashcat.

```bash
# Find what's installed
ls /usr/share/john/ | grep 2john
locate 2john
```

| Utility | Use case | Hashcat Mode |
|---------|----------|--------------|
| `zip2john` | Encrypted ZIP archive | 13600 (PKZIP) / 17225 |
| `7z2john.pl` | Encrypted 7z archive | 11600 |
| `rar2john` | RAR3/RAR5 archive | 12500 / 13000 |
| `pdf2john.pl` | Password-protected PDF | 10400–10700 (depends on version) |
| `office2john.py` | MS Office (doc/docx/xls/xlsx/ppt/pptx) | 9400–9800 |
| `keepass2john` | KeePass kdb / kdbx | 13400 |
| `ssh2john.py` | Encrypted SSH private key | 22921 (RSA) / 22931 (ED25519) |
| `gpg2john` | GPG private key | 17010 |
| `bitlocker2john` | BitLocker volume | 22100 |
| `truecrypt2john.py` / `veracrypt2john.py` | Container volumes | 6211–6243 / 13711–13773 |
| `pfx2john.py` | PKCS#12 / `.pfx` cert store | 24410 |
| `racf2john` | Mainframe RACF | 8500 |

**Workflow** — extract, strip the filename prefix, then hand off:

```bash
zip2john secret.zip > zip.hash
john --wordlist=rockyou.txt zip.hash

# For hashcat: drop the "filename:" prefix
cut -d: -f2- zip.hash > zip.hashcat
hashcat -m 17225 zip.hashcat rockyou.txt
```

```bash
ssh2john ~/loot/id_rsa > id_rsa.hash
john --wordlist=rockyou.txt id_rsa.hash

keepass2john Passwords.kdbx > kp.hash
hashcat -m 13400 <(cut -d: -f2- kp.hash) rockyou.txt

office2john.py finance.xlsx > office.hash
hashcat -m 9600 <(cut -d: -f2- office.hash) rockyou.txt
```

!!! tip "Real-world"
    Recovered KeePass databases, encrypted 7z archives in IT shares, and bitlocker recovery volumes pulled from disk images are some of the highest-value loot you'll find. Always run `*2john` on these — even a weak passphrase from rockyou unlocks the rest of the credential tree.

---

## Hashcat

### Basic wordlist attack

```bash
hashcat -m <mode> hashes.txt /usr/share/wordlists/rockyou.txt
```

### Wordlist + rules (best starting point)

```bash
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/OneRuleToRuleThemAll.rule
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/best64.rule
hashcat -m 1000 hashes.txt rockyou.txt -r /usr/share/hashcat/rules/dive.rule       # last resort, very slow
```

`OneRuleToRuleThemAll.rule` source: [NotSoSecure](https://github.com/NotSoSecure/password_cracking_rules)

### Mask attack (pattern-based)

```bash
# 8 chars: uppercase + 6 lowercase + 2 digits  (e.g., Password12)
hashcat -m 1000 hashes.txt -a 3 ?u?l?l?l?l?l?d?d

# Corporate pattern: 6-char word + 4-digit year
hashcat -m 1000 hashes.txt -a 3 ?l?l?l?l?l?l?d?d?d?d

# Increment length 6→10 with mixed alphanumeric
hashcat -m 1000 hashes.txt -a 3 -i --increment-min 6 --increment-max 10 ?a?a?a?a?a?a?a?a?a?a
```

| Mask | Character Set |
|---|---|
| `?l` | Lowercase a-z |
| `?u` | Uppercase A-Z |
| `?d` | Digits 0-9 |
| `?s` | Symbols `!@#$...` |
| `?a` | All printable ASCII |
| `?h` / `?H` | Hex lowercase / uppercase |

### Hybrid (wordlist + mask)

```bash
hashcat -m 1000 hashes.txt -a 6 rockyou.txt ?d?d?d?d        # word + 4 digits appended
hashcat -m 1000 hashes.txt -a 7 ?d?d?d?d rockyou.txt        # 4 digits + word prepended
```

### Combinator attack

```bash
hashcat -m 1000 hashes.txt -a 1 wordlist1.txt wordlist2.txt
```

### Performance & operational flags

```bash
hashcat -m 1000 hashes.txt rockyou.txt -O -w 3              # optimised kernels, full GPU workload
hashcat -m 1000 hashes.txt rockyou.txt --status --status-timer 30
hashcat -b -m 1000                                          # benchmark a single mode
```

| Flag | Effect |
|------|--------|
| `-O` | Optimised kernels — faster, but caps password length (~32). Drop for long passphrases. |
| `-w 3` / `-w 4` | Workload profile. `4` is full-throttle, will lag your desktop. |
| `--username` | Strip a leading `user:` from the hash file. |
| `--show` / `--left` | Show cracked / uncracked entries. |
| `--potfile-disable` | Don't read/write the potfile (useful for clean re-runs). |

### Resume a session

```bash
hashcat --session crackjob -m 1000 hashes.txt rockyou.txt
hashcat --session crackjob --restore
```

---

## John the Ripper

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
john --format=NT --wordlist=rockyou.txt hashes.txt
john --rules=Jumbo --wordlist=rockyou.txt hashes.txt
john --show hashes.txt
john --list=formats | grep -i krb                           # list supported formats
```

John auto-detects format on most hashes — only specify `--format=` when it guesses wrong (common with `*2john` output that has ambiguous prefixes).

---

## Username Generation

When you have employee names from LinkedIn / OSINT, for example, but no usernames, permute them with username-anarchy before spraying:

```bash
git clone https://github.com/urbanadventurer/username-anarchy.git
cd username-anarchy

./username-anarchy -i names.txt > usernames.txt             # input: "John Doe" per line
./username-anarchy --input-file names.txt --select-format first,flast,first.last,f.last
./username-anarchy John Doe                                 # one-off generation
```

Output covers every common scheme — `jdoe`, `john.doe`, `doe.john`, `j.doe`, `doej`, `johnd`, etc. Feed straight into Kerbrute / NetExec / spray:

```bash
kerbrute userenum -d corp.local --dc 10.10.10.10 usernames.txt
nxc smb 10.10.10.10 -u usernames.txt -p 'Spring2026!' --continue-on-success
```

See [Kerbrute](kerbrute.md) for AD username validation and [NetExec](netexec.md) for spraying patterns.

---

## Wordlist Generation

### CeWL — crawl a target and generate a custom wordlist

Useful when the target likely has a custom password policy (company name, product names):

```bash
cewl http://10.10.10.10 -d 3 -m 5 -o cewl.txt
cewl https://example.com -d 3 -m 5 --with-numbers -e -o cewl.txt    # include emails
hashcat -m 1000 hashes.txt cewl.txt -r best64.rule
```

### Crunch — pattern-based generation

```bash
crunch 8 10 abcdefghijklmnopqrstuvwxyz0123456789 -o custom.txt
crunch 8 8 -t Pass@,%%      # P, a, s, s, @, [A-Z], [0-9], [0-9]
```

### Mentalist / Mutate — rule-augmented permutations

```bash
hashcat --stdout cewl.txt -r best64.rule > cewl-mutated.txt
```

---

## Linux /etc/shadow

```bash
unshadow /etc/passwd /etc/shadow > combined.txt
john combined.txt --wordlist=/usr/share/wordlists/rockyou.txt
hashcat -m 1800 combined.txt rockyou.txt                    # SHA-512crypt
hashcat -m 30900 combined.txt rockyou.txt                   # yescrypt (Debian 12+/Ubuntu 24.04+)
```

`unshadow` merges the username/UID from `passwd` with the hash from `shadow` so John can attribute cracks to accounts. Modern Debian/Ubuntu now default to `yescrypt` (`$y$`) rather than `$6$` — check the prefix before picking the mode.
