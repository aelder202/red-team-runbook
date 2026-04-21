# Red Team Runbook

*A practitioner's reference for offensive security operations — built from real engagements and lab work.*

---

## About

This runbook is a living reference I've built working as a penetration tester specializing in web application security, while actively expanding into network, Active Directory, and full-scope engagements through lab environments (HackTheBox, GOAD, etc.).

It is not a tutorial. It assumes you know what you're doing and need to find the right command fast. Each section has been reviewed for accuracy and annotated with real-world notes — things that don't show up in documentation but matter in practice.

## What's Here

| Section | What you'll find |
|---|---|
| [Information Gathering](information-gathering/index.md) | Per-service enumeration cheatsheets (22 services) |
| [Network Scanning & Recon](network-scanning/index.md) | Nmap, traffic capture, host enumeration |
| [Exploitation](exploitation/index.md) | Shells, credential attacks, binary exploitation, frameworks |
| [Applications](applications/index.md) | Web app exploits, fuzzing, auth attacks, tools |
| [Privilege Escalation](privilege-escalation/index.md) | Linux, Windows, Active Directory |
| [Persistence](persistence/index.md) | Linux/Windows backdoors, DLL injection, scheduled tasks |
| [Data Exfiltration](data-exfiltration/index.md) | File transfer techniques, secure channels |
| [Port Forwarding & Tunneling](port-forwarding/index.md) | Ligolo-ng, Chisel, SSH tunneling |
| [Tools](tools/index.md) | Bloodhound, Impacket, Mimikatz, NetExec, and more |

## Annotations

Throughout the runbook you'll find three types of annotations:

!!! tip "Tip"
    Non-obvious shortcuts, personal tool preferences, and things worth knowing before you start.

!!! warning "Watch out"
    Common failure modes, things that get caught by AV/WAF, or mistakes that waste time.

!!! note "From the lab"
    Observations from real HTB machines and lab environments. No box names or solutions — just the technique insight.

---

*Built by [aelder202](https://github.com/aelder202).*
