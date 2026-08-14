# SNMP Multiplexer (199)

!!! tip "Start here"
    SMUX is a legacy TCP protocol used between an SNMP agent and cooperating subagents. It is not an alternate endpoint for `snmpwalk`. Treat an exposed listener as a fingerprinting lead, then enumerate the actual SNMP service on UDP 161.

---

## Enumeration

```bash
nmap -sV -p 199 $IP
nc -nv $IP 199
```

Do not send SNMP queries to port 199; SMUX peers establish a structured session with the agent over TCP. If UDP 161 is accessible, continue with [SNMP enumeration](snmp.md).
