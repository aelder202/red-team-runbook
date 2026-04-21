# EyeWitness

!!! tip "Tip"
    EyeWitness is most useful after an nmap scan — pipe the XML output directly: `eyewitness --web -x nmap.xml`. The HTML report lets you quickly identify interesting services without opening each one manually.

---

## Basic Usage

```bash
eyewitness --web -f targets.txt -d output --timeout 10
```

---

## Scanning a Single URL

```bash
eyewitness --web -u http://10.10.10.10 -d output
```

---

## Scanning RDP and VNC Services

```bash
eyewitness --rdp --vnc -f targets.txt -d output
```

---

## Scanning Nmap XML Output

```bash
eyewitness -x scan.xml -d output
```

---

## Headless Report

```bash
eyewitness --headless -f targets.txt -d output
```
