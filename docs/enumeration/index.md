---
description: Host discovery, TCP and UDP scans, and first checks for common services.
---

# Enumeration

## First pass

```bash
sudo nmap -sS -sV -Pn -n --top-ports 1000 --open -oA quick "$IP"
```

Scans the 1,000 most common TCP ports and identifies the services it finds. Results save as `quick.nmap`, `quick.gnmap`, and `quick.xml` in the current directory. Use `-sT` instead of `-sS` without raw-packet privileges.

## All TCP ports

```bash
sudo nmap -sS -sV -Pn -n -p- --open -oA full "$IP"
```

Run this in another terminal while checking the first results. It includes high ports missed by the quick scan. For large ranges, start with [host discovery](network-scanning.md#host-discovery).

## UDP

```bash
sudo nmap -sU -sV -Pn -n --top-ports 100 --open -oA udp "$IP"
```

This is an initial UDP pass, not all 65,535 ports. `open|filtered` means Nmap could not tell whether a service is listening; `-sV` may resolve it by getting a protocol response.

## Work the open services

Use the actual listener port if it differs from the default. Pick the matching service for the full checks.

=== "HTTP/S"

    ```bash
    curl -ki "https://$IP/"
    ```

    Check redirects, page content, and authentication. Use `http://` for a plaintext listener. [HTTP/S checks →](../information-gathering/service-analysis/http-80-443.md)

=== "SMB"

    ```bash
    smbclient -N -U '' -L "//$IP"
    ```

    Lists shares without credentials. Try listing a returned share's contents next. [SMB checks →](../information-gathering/service-analysis/smb.md)

=== "LDAP"

    ```bash
    ldapsearch -x -H "ldap://$IP" -s base -b '' \
      namingContexts
    ```

    Returns search bases. Query one of those bases to test directory access. [LDAP checks →](../information-gathering/service-analysis/ldap.md)

=== "DNS"

    ```bash
    dig @"$IP" "$DOMAIN" SOA
    dig @"$IP" "$DOMAIN" NS
    ```

    Check the known domain's authority and nameservers; follow with relevant records and zone-transfer checks. [DNS checks →](../information-gathering/service-analysis/dns-53.md)

=== "FTP"

    ```bash
    curl --user 'anonymous:anonymous@' "ftp://$IP/"
    ```

    Tests anonymous directory access. Look for backups and application files. [FTP checks →](../information-gathering/service-analysis/ftp-21.md)

=== "NFS"

    ```bash
    showmount -e "$IP"
    ```

    Lists exports and allowed clients. NFSv4-only servers may not expose this list. [NFS checks →](../information-gathering/service-analysis/nfs-2049.md)

=== "Redis"

    ```bash
    redis-cli -h "$IP" INFO
    ```

    Check authentication, server metadata, and populated databases. [Redis checks →](../information-gathering/service-analysis/redis-6379.md)

[All service playbooks →](../information-gathering/index.md)

## Found a hostname?

```bash
# Set this to a hostname from a redirect, certificate, or configuration
VHOST=app.example.com

dig +short "$VHOST"
curl -ki --resolve "$VHOST:443:$IP" "https://$VHOST/"
```

`--resolve` connects to the target IP using the supplied hostname for both HTTP Host and TLS SNI. Use the observed port in both places. `-k` skips certificate validation for inspection.

If the response changes from the IP-only request, enumerate that named site: [content discovery](../applications/enumeration/directory-page-fuzzing.md) · [vhost discovery](../applications/enumeration/subdomain-parameter-fuzzing.md).

## Got credentials?

```bash
# List shares as the known domain user; prompts for the password
smbclient -L "//$IP" -U "$NETBIOS/<user>"

# List a share that denied anonymous access
smbclient "//$IP/<share>" -U "$NETBIOS/<user>" -c 'ls'
```

Repeat the relevant service checks as that user. Readable configs often identify database hosts, service accounts, or web paths. Follow those into the corresponding service page.

## Scan looks wrong?

| Result | Check |
|---|---|
| A known host is reported down | Use `-Pn` to skip host discovery; the commands above already include it |
| Ports are `filtered` | Add `--reason`; check the route/VPN before increasing scan speed |
| UDP ports remain <code>open&#124;filtered</code> | Send a native request such as `dig` or `snmpget`; silence does not confirm an open service |
| A service works by name but not IP | Use the hostname; HTTPS may depend on Host/SNI |
| Results vary between scans | Remove fixed rate/retry tuning and rescan the affected ports |

More scanning options: [Network Scanning](network-scanning.md). Nmap reference: [service detection](https://nmap.org/book/man-version-detection.html).
