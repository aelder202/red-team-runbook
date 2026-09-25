---
description: Choose the first checks and follow-up questions for each discovered service.
---

# Service Playbooks

**Found an open port? Confirm the protocol, check the current access, then follow the result.** Start with the service below. For scans and quick service checks, use [Enumeration](../enumeration/index.md).

## Find your service

Ports below are common defaults, not identification rules. Use the observed listener port in the linked commands. Start with exposed resources and known access; pursue exploitation once its prerequisites are established.

### Web and remote access

| Service · common ports | First checks | Follow the result |
|---|---|---|
| [HTTP/HTTPS · TCP 80, 443](service-analysis/http-80-443.md) | Response, redirects, TLS names, named hosts | Map routes, roles, APIs, and the identified application |
| [SSH · TCP 22](service-analysis/ssh-22.md) | Banner, host key, supported authentication | Validate a known account/key; enumerate the resulting host access |
| [WinRM · TCP 5985, 5986](service-analysis/winrm.md) | HTTP(S) endpoint and authentication | Test a known identity; establish whether remote management is allowed |
| [RDP · TCP 3389](service-analysis/rdp-3389.md) | Service identity and NLA configuration | Check permitted remote logon with a known identity |
| [VNC · TCP 5900+](service-analysis/vnc-5900.md) | RFB version and security types | Check the authentication requirement before desktop access |
| [Telnet · TCP 23](service-analysis/telnet-23.md) | Banner and login prompt | Identify the device; validate a known account |
| [R-Services · TCP 512–514](service-analysis/r-services.md) | Confirm rexec, rlogin, or rsh | Investigate host/user trust and account requirements |

### Files and shares

| Service · common ports | First checks | Follow the result |
|---|---|---|
| [SMB · TCP 139, 445](service-analysis/smb.md) | Host/domain, signing, anonymous/guest share access | Inspect readable files; repeat with credentials; follow domain leads |
| [FTP · TCP 21](service-analysis/ftp-21.md) | Banner, anonymous login, directory listing | Inspect selected files; establish any relationship to web content |
| [NFS · TCP/UDP 2049](service-analysis/nfs-2049.md) | RPC/export visibility and NFS version | Check accessible paths and UID/GID mapping; export listings may be unavailable on NFSv4 |
| [Rsync · TCP 873](service-analysis/rsync-873.md) | Module listing and authentication | List an accessible module before downloading selected files |
| [TFTP · UDP 69](service-analysis/tftp-69.md) | Protocol response and known filenames | Request a file named by other evidence; TFTP has no standard directory listing |

### Names, identity, and management

| Service · common ports | First checks | Follow the result |
|---|---|---|
| [DNS · TCP/UDP 53](service-analysis/dns-53.md) | Relevant records and authoritative servers | Check zone transfer where applicable; correlate names and addresses |
| [LDAP · TCP 389, 636](service-analysis/ldap.md) | RootDSE, naming contexts, search access | Query users/computers with the available identity; correlate domain data |
| [Kerberos · TCP/UDP 88](service-analysis/kerberos-88.md) | Realm, KDC, DNS, and time context | Correlate confirmed identities and account properties with AD enumeration |
| [SNMP · UDP 161; traps 162](service-analysis/snmp.md) | Version, known community or SNMPv3 identity | Query system/interface OIDs, then expand relevant subtrees |
| [SNMP Multiplexer · TCP 199](service-analysis/snmp-multiplexer.md) | Confirm SMUX rather than assuming SNMP | Identify the management stack and related SNMP exposure |
| [IPMI · UDP 623](service-analysis/ipmi-623.md) | BMC identity and authentication capabilities | Assess configured authentication; separate hash retrieval from basic discovery |
| [IKE · UDP 500, 4500](service-analysis/isakmp-ike.md) | IKE version, response, and proposals | Establish VPN identity/authentication requirements before PSK testing |

### Databases and APIs

| Service · common ports | First checks | Follow the result |
|---|---|---|
| [MSSQL · TCP 1433](service-analysis/mssql-1433.md) | Instance identity, authentication, effective SQL role | Enumerate databases and linked servers; check privileges before OS execution |
| [MySQL · TCP 3306](service-analysis/mysql-3306.md) | Version, account identity, grants | Inspect accessible schemas; distinguish data access from file privileges |
| [PostgreSQL · TCP 5432](service-analysis/postgresql-5432.md) | Authentication, role, database access | Inspect schemas and role memberships before privileged operations |
| [Oracle TNS · TCP 1521](service-analysis/oracle-tns-1521.md) | Listener and service/SID information | Connect with a known account and enumerate granted roles |
| [MongoDB · TCP 27017](service-analysis/mongodb-27017.md) | Server response and authorization requirement | List permitted databases/collections and inspect a bounded sample |
| [Redis · TCP 6379](service-analysis/redis-6379.md) | Authentication, server metadata, keyspace access | Iterate keys; check command permissions separately from data access |
| [Elasticsearch · TCP 9200](service-analysis/elasticsearch-9200.md) | HTTP response, authentication, cluster/index metadata | Query selected indices with bounded results |
| [Docker API · TCP 2375, 2376](service-analysis/docker-2375.md) | API response, TLS/client authentication, readable metadata | Inspect containers/mounts; container creation is an exploitation step |

### Mail

| Service · common ports | First checks | Follow the result |
|---|---|---|
| [SMTP · TCP 25, 465, 587](service-analysis/smtp.md) | Greeting, EHLO features, STARTTLS | Check identity disclosure or relay policy with a controlled test |
| [IMAP · TCP 143, 993](service-analysis/imap.md) | Capabilities and TLS/authentication | With a known identity, list permitted mailboxes before reading messages |
| [POP3 · TCP 110, 995](service-analysis/pop3.md) | Capabilities and TLS/authentication | With a known identity, inspect mailbox metadata before retrieving messages |

## Turn output into a next step

| Observation | Next action |
|---|---|
| Anonymous access returns resources | Test a specific list/read operation and record its scope |
| Authentication is required | Save identity/mechanism details; revisit when a relevant credential appears |
| A credential works | Repeat resource enumeration under that identity; record effective permissions |
| Names, paths, or backend endpoints appear | Correlate them across services and check new targets against scope |
| A potentially exploitable configuration appears | Confirm prerequisites, select a bounded proof, and account for changes |
| A check fails | Distinguish access denial, transport failure, and unsupported tooling before choosing another check |

Return to [Enumeration](../enumeration/index.md) for scans and quick checks.
