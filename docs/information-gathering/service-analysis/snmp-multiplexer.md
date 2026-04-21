# SNMP Multiplexer (199)

!!! tip "Start here"
    UDP 199 is the SNMP MUX — it forwards queries to the SNMP engine. If port 161 is filtered but 199 is open, try querying directly: `snmpwalk -v1 -c public 10.10.10.10:199`. Otherwise, treat this as a signal that SNMP is running and focus enumeration on port 161.

---

## Enumeration

```bash
nmap -sU -p 199 10.10.10.10
snmpwalk -v1 -c public 10.10.10.10:199
```

If SNMP on port 161 is accessible, see the [SNMP (161, 162)](snmp.md) page for full enumeration.
