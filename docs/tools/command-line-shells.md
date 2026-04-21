!!! tip "Tip"
    For Windows: PowerShell is more capable but more monitored than cmd.exe. Use `cmd.exe` for quick recon commands, PowerShell for scripting and .NET access. On Linux, check `echo $SHELL` — you may be in a restricted shell and not know it.

## Setting Global Variables

### Zshell
```bash
export IP=192.168.1.10
export URL=http://192.168.1.10
echo $IP
echo $URL
```

### Fish
```bash
set -x IP 192.168.1.10
set -x URL http://192.168.1.10
echo $IP
echo $URL
```

---
## Searchsploit

* Download exploit: `-m` 
* Include URL in results: `-u`

---
## Terminator (Split Terminal Windows)

Split terminal windows for multitasking:

- **Split Horizontally**: `Ctrl+Shift+O`
- **Split Vertically**: `Ctrl+Shift+E`
- **Close Window**: `exit`
