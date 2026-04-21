## **IMPORTANT**

If this port is open, refer to the [[SNMP (161, 162)|SNMP Services]] page to see if SNMP is open. If so, use the commands to enumerate SNMP further and attempt to search for exploits for any processes or other valuable information returned from the nmap scan.

!!! tip "Start here"
    UDP 199 alone rarely yields direct exploits — pivot to the main SNMP page and run `snmpwalk -v2c -c public <target>` against port 161. If port 161 is filtered but 199 is open, the SNMP MUX may still forward queries: try `snmpwalk -v1 -c public <target>:199`.

## Overview

**SNMP Multiplexer (SNMP MUX)** running over **UDP port 199** facilitates communication between multiple SNMP subsystems by forwarding SNMP queries to the appropriate SNMP engine.

While SNMP MUX may not be *directly* vulnerable/exploitable, it can be paired with SNMP enumeration to extract valuable information for exploitation of the target machine.