# Command Line Shells

!!! tip ""
    For Windows: PowerShell is more capable but more monitored than cmd.exe. Use `cmd.exe` for quick recon, PowerShell for scripting and .NET access. On Linux, check `echo $SHELL` — you may be in a restricted shell.

---

## Setting Shell Variables

```bash
export IP=10.10.10.10
export URL=http://10.10.10.10
```

---

## Searchsploit

```bash
searchsploit apache 2.4          # search
searchsploit -m 12345            # download exploit to current dir
searchsploit -u                  # update database
```

---

## Terminator Shortcuts

- Split horizontal: `Ctrl+Shift+O`
- Split vertical: `Ctrl+Shift+E`
- Switch pane: `Alt+Arrow`
