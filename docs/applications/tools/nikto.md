Nikto is a web server scanner designed to identify vulnerabilities, outdated software, and security misconfigurations in web applications.

## Basic Usage

```
nikto -h http://target.com
```

- `-h` → Specifies the target host.

## Scanning a Specific Port

```
nikto -h http://target.com -p 8080
```

- `-p` → Defines the port to scan.

## Using a Proxy

```
nikto -h http://target.com -useproxy http://127.0.0.1:8080
```

- Routes traffic through a proxy, useful for Burp Suite interception.

## Saving Scan Results

```
nikto -h http://target.com -o results.txt -Format txt
```

- `-o results.txt` → Saves output to a file.
- `-Format txt` → Specifies output format.

## Disabling SSL Certificate Verification

```
nikto -h https://target.com -nossl
```

- Prevents SSL/TLS verification errors.

## Running a Stealthy Scan

```
nikto -h http://target.com -Tuning 4
```

- `-Tuning 4` → Focuses on fewer but more targeted checks.

## Specifying a User-Agent

```
nikto -h http://target.com -UserAgent "Mozilla/5.0"
```

- Simulates requests from a specific browser.

## Limiting Requests Per Second

```
nikto -h http://target.com -delay 2
```

- `-delay 2` → Waits 2 seconds between requests to avoid detection.