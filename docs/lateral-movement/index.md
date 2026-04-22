# Lateral Movement

Techniques for moving from one compromised host to another within a network. Credential reuse and ticket abuse are the primary vectors — most environments rely on the same service accounts across multiple machines.

!!! warning "Watch out"
    Lateral movement is the noisiest phase of an assessment. Each new host you touch generates authentication events (4624, 4648, 4769). Keep a log of every host accessed — both for cleanup and for the report.

| Goal | Best method |
|---|---|
| Interactive shell with credentials | `evil-winrm` (port 5985) |
| Shell with hash (no cracking needed) | `impacket-psexec` or `impacket-wmiexec` + `-hashes` |
| Domain user impersonation | Pass-the-Ticket / Overpass-the-Hash |
| Captured NTLMv2, SMB signing off | NTLM Relay (`ntlmrelayx`) |
| Kerberos-only environment | `impacket-wmiexec -k -no-pass` |
