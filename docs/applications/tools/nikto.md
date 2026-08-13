# Nikto

!!! tip "Tip"
    Nikto is loud and slow. Use it when you're not worried about detection. Pair with `-o output.html` to save results. For a faster scan, use `-Tuning 9` to check for SQL injection only.

!!! warning "Watch out"
    Nikto generates a lot of false positives. Cross-reference findings manually before reporting, especially header-based findings.

---

## Basic Usage

```bash
nikto -h http://$IP
```

---

## Scanning a Specific Port

```bash
nikto -h http://$IP -p 8080
```

---

## Using a Proxy

```bash
nikto -h http://$IP -useproxy http://127.0.0.1:8080
```

---

## Saving Scan Results

```bash
nikto -h http://$IP -o results.txt -Format txt
```

---

## Disabling SSL Certificate Verification

```bash
nikto -h https://$IP -nossl
```

---

## Running a Stealthy Scan

```bash
nikto -h http://$IP -Tuning 4
```

- `-Tuning 4` → Focuses on fewer but more targeted checks.

---

## Specifying a User-Agent

```bash
nikto -h http://$IP -UserAgent "Mozilla/5.0"
```

---

## Limiting Requests Per Second

```bash
nikto -h http://$IP -delay 2
```

- `-delay 2` → Waits 2 seconds between requests to avoid detection.
