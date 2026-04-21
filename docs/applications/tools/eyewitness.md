## Basic Usage

!!! tip "Tip"
    EyeWitness is most useful after an nmap scan — pipe the XML output directly: `eyewitness --web -x nmap.xml`. The HTML report lets you quickly identify interesting services without opening each one manually.

```
eyewitness --web -f targets.txt -d output --timeout 10
```

- `--web` → Captures screenshots of web applications.
- `-f targets.txt` → Specifies a file containing a list of targets.
- `-d output` → Defines the directory where results will be stored.
- `--timeout 10` → Sets a timeout of 10 seconds for each request.
### scanning a single url

```
eyewitness --web -u http://target.com -d output
```

### scanning rdp and vnc services

```
eyewitness --rdp --vnc -f targets.txt -d output
```

- `--rdp` → Captures RDP login screens.
- `--vnc` → Captures VNC login screens.
### scanning nmap xml output

```
eyewitness -x scan.xml -d output
```

- `-x` → Uses an Nmap XML output file to extract web-based services.
    
### generating a headless report

```
eyewitness --headless -f targets.txt -d output
```

- `--headless` → Runs without opening a GUI, useful for automation.
