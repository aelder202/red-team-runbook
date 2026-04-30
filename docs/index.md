# Red Team Runbook

*A practitioner's reference for offensive security operations - built from real engagements and lab work.*

---

## About

This runbook is a living reference I've built while working as a penetration tester specializing in web application security, and while expanding into network, Active Directory, and full-scope engagements through lab environments like HackTheBox and GOAD.

It is not a tutorial. It assumes you know what you're doing and need to find the right command fast. Each section is organized for practical use during authorized testing, CTFs, and lab work, with notes from real practice where the details matter.

## Use This When

- You know the target service or phase and need commands fast
- You want enumeration paths by protocol or application type
- You need escalation, movement, persistence, transfer, or tunneling references
- You want tool syntax without digging through full documentation

## Workflow

`Recon -> Services -> Applications -> Exploitation -> Priv Esc -> Lateral Movement -> Persistence -> Data Exfiltration -> Tunneling -> Tools`

## What's Here

| Section | What you'll find |
|---|---|
| [Recon](network-scanning/index.md) | Nmap, traffic capture, host enumeration, screenshots |
| [Services](information-gathering/index.md) | Per-service enumeration cheatsheets |
| [Applications](applications/index.md) | Web app exploits, fuzzing, auth attacks, tools |
| [Exploitation](exploitation/index.md) | Shells, credential attacks, binary exploitation, frameworks |
| [Priv Esc](privilege-escalation/index.md) | Linux, Windows, Active Directory |
| [Lateral Movement](lateral-movement/index.md) | Windows and Active Directory movement paths |
| [Persistence](persistence/index.md) | Linux/Windows backdoors, DLL injection, scheduled tasks |
| [Data Exfiltration](data-exfiltration/index.md) | File transfer techniques, secure channels |
| [Tunneling](port-forwarding/index.md) | Port forwarding, Ligolo-ng, Chisel, SSH tunneling |
| [Tools](tools/index.md) | BloodHound, Impacket, Mimikatz, NetExec, and more |

## Annotations

Throughout the runbook you'll find three types of annotations:

!!! tip "Tip"
    Non-obvious shortcuts, personal tool preferences, and things worth knowing before you start.

!!! warning "Watch out"
    Common failure modes, things that get caught by AV/WAF, or mistakes that waste time.

!!! note "From the lab"
    Observations from real HTB machines and lab environments. No box names or solutions - just the technique insight.

---

*Built by [aelder202](https://github.com/aelder202).*
