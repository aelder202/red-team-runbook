## **IMPORTANT**

If this port is open, refer to the [[SNMP (161, 162)|SNMP Services]] page to see if SNMP is open. If so, use the commands to enumerate SNMP further and attempt to search for exploits for any processes or other valuable information returned from the nmap scan.
## Overview

**SNMP Multiplexer (SNMP MUX)** is a protocol component that allows multiple SNMP agents to operate on a single device. Running over **UDP port 199**, it facilitates communication between multiple SNMP subsystems by forwarding SNMP queries to the appropriate SNMP engine.

While SNMP MUX may not be *directly* vulnerable/exploitable, it can be paired with SNMP enumeration to extract valuable information for exploitation of the target machine.