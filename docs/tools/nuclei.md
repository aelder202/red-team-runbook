### Nuclei for Web/API Enumeration

Nuclei is a fast, template-based vulnerability scanner used for web application and API enumeration. It allows penetration testers to identify misconfigurations, security vulnerabilities, and API endpoints using customizable templates.

---

### Installing Nuclei

If not already installed, Nuclei can be installed via:

```bash
curl -s https://api.github.com/repos/projectdiscovery/nuclei/releases/latest | grep "browser_download_url.*nuclei-linux-amd64" | cut -d : -f 2,3 | tr -d \" | wget -qi -
chmod +x nuclei-linux-amd64
mv nuclei-linux-amd64 /usr/local/bin/nuclei
```

Verify installation:

```bash
nuclei -version
```

---

### Updating Nuclei Templates

Nuclei uses templates for scanning various vulnerabilities, API endpoints, and web assets. Update them before running a scan:

```bash
nuclei -update
```

To view available templates:

```bash
ls ~/.nuclei-templates/
```

---

### Basic Web Enumeration

Scanning a single URL:

```bash
nuclei -u https://target.com
```

Scanning multiple URLs:

```bash
cat urls.txt | nuclei -l -
```

---

### API Enumeration with Nuclei

Nuclei has built-in templates for detecting API misconfigurations and sensitive endpoints.

##### Identifying API Endpoints

```bash
nuclei -u https://target.com -t http/api/api-endpoints.yaml
```

##### Scanning for API Keys and Sensitive Data

```bash
nuclei -u https://target.com -t http/exposures/api-tokens.yaml
```

##### Checking for Open API (Swagger) Exposure

```bash
nuclei -u https://target.com -t http/api/openapi.yaml
```

##### Detecting GraphQL Misconfigurations

```bash
nuclei -u https://target.com -t http/api/graphql.yaml
```

---

### Advanced Usage for Web Enumeration

##### Running a Full Web Security Scan

```bash
nuclei -u https://target.com -t http/
```

This will run all HTTP-based templates against the target.

##### Scanning for CVEs in Web Applications

```bash
nuclei -u https://target.com -t cves/
```

##### Finding Subdomains and Associated Services

```bash
nuclei -u https://target.com -t dns/
```

---

### Customizing Nuclei Scans

##### Excluding False Positives

```bash
nuclei -u https://target.com -t http/ -exclude-severity info
```

##### Saving Output to a File

```bash
nuclei -u https://target.com -t http/ -o results.txt
```

##### Running Nuclei with Proxy for Stealth

```bash
nuclei -u https://target.com -proxy http://127.0.0.1:8080
```

---

### Combining Nuclei with Other Tools

##### Running Nuclei on Subdomain Enumeration Results

```bash
subfinder -d target.com -silent | nuclei -t http/
```

##### Using Nuclei with FFuF for Parameter Fuzzing

```bash
ffuf -w wordlist.txt -u https://target.com/FUZZ | nuclei -t http/
```