# Lateral Movement

After establishing a foothold, lateral movement extends access to other hosts in the network. The goal is to reach higher-value targets — file servers, domain controllers, databases — using credentials and tickets collected from the initial compromise.

!!! warning "Watch out"
    Lateral movement is the noisiest phase of an assessment. Every new host you touch generates authentication events (4624, 4648, 4769). Log every host you access — both for cleanup and for the report.

---

## Methodology

### 1. Assess What You Have

Before moving anywhere, take stock of your current credentials and access:

```bash
# What user are you?
whoami /all                          # Windows
id && cat /etc/passwd | grep -v nologin  # Linux

# What creds/hashes do you have?
cat /tmp/loot.txt                    # any dumped creds
# Check secretsdump output, mimikatz output, found config files
```

---

### 2. Validate Credentials Across the Network

Spray what you have against all discovered hosts before moving manually:

```bash
nxc smb 10.10.10.0/24 -u <user> -p '<pass>'          # password
nxc smb 10.10.10.0/24 -u <user> -H <ntlm-hash>       # hash
nxc winrm 10.10.10.0/24 -u <user> -p '<pass>'        # WinRM
```

Hosts returning `(Pwn3d!)` have local admin access.

---

### 3. Choose an Execution Method

Match the method to what's available on the target:

| Available | Best method |
|---|---|
| Port 5985/5986 (WinRM) | `evil-winrm` — most comfortable interactive shell |
| Port 445 (SMB) + admin | `impacket-psexec` or `impacket-wmiexec` |
| Hash only (no plaintext) | Pass-the-Hash via `psexec`, `wmiexec`, or `evil-winrm -H` |
| Kerberos ticket | Pass-the-Ticket — inject with Mimikatz or Rubeus |
| NTLMv2 captured + SMB signing off | NTLM relay with `ntlmrelayx` |

See [Windows Lateral Movement](windows.md) for execution method commands and [Active Directory Lateral Movement](active-directory.md) for Kerberos-based movement.

---

### 4. Establish Access and Repeat

Once on a new host, repeat the privilege escalation process:

```bash
whoami /priv             # check token privileges immediately
net localgroup Administrators   # who has local admin?
```

Then repeat credential dumping and network spraying from the new position — you may now have access to a different network segment or higher-privilege credentials.

!!! tip "Real-world"
    Keep a simple text file tracking which hosts you've accessed, what credentials were used, and what you found. It saves time when writing the report and ensures nothing gets missed during cleanup.
