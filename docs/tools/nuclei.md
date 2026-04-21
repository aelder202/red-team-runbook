# Nuclei — Vulnerability Scanner

!!! tip "Tip"
    For web API enumeration: `nuclei -u https://10.10.10.10 -t exposed-panels/ -t exposures/ -t misconfiguration/` covers the most impactful templates. Use `-severity critical,high` to filter noise. Nuclei is much faster than manual checks for known CVEs on large scope.

---

## Updating Nuclei Templates

```bash
nuclei -update
```

View available templates:

```bash
ls ~/.nuclei-templates/
```

---

## Basic Web Enumeration

Scanning a single URL:

```bash
nuclei -u https://10.10.10.10
```

Scanning multiple URLs:

```bash
cat urls.txt | nuclei -l -
```

---

## API Enumeration with Nuclei

### Identifying API Endpoints

```bash
nuclei -u https://10.10.10.10 -t http/api/api-endpoints.yaml
```

### Scanning for API Keys and Sensitive Data

```bash
nuclei -u https://10.10.10.10 -t http/exposures/api-tokens.yaml
```

### Checking for Open API (Swagger) Exposure

```bash
nuclei -u https://10.10.10.10 -t http/api/openapi.yaml
```

### Detecting GraphQL Misconfigurations

```bash
nuclei -u https://10.10.10.10 -t http/api/graphql.yaml
```

---

## Advanced Usage

### Running a Full Web Security Scan

```bash
nuclei -u https://10.10.10.10 -t http/
```

### Scanning for CVEs in Web Applications

```bash
nuclei -u https://10.10.10.10 -t cves/
```

### Finding Subdomains and Associated Services

```bash
nuclei -u https://10.10.10.10 -t dns/
```

---

## Customizing Nuclei Scans

### Excluding False Positives

```bash
nuclei -u https://10.10.10.10 -t http/ -exclude-severity info
```

### Saving Output to a File

```bash
nuclei -u https://10.10.10.10 -t http/ -o results.txt
```

### Running Nuclei with Proxy for Stealth

```bash
nuclei -u https://10.10.10.10 -proxy http://127.0.0.1:8080
```

---

## Combining Nuclei with Other Tools

### Running Nuclei on Subdomain Enumeration Results

```bash
subfinder -d example.com -silent | nuclei -t http/
```

### Using Nuclei with FFuF for Parameter Fuzzing

```bash
ffuf -w wordlist.txt -u https://10.10.10.10/FUZZ | nuclei -t http/
```
