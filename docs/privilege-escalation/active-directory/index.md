# Active Directory Privilege Escalation

Attack paths for moving from a domain foothold to Domain Admin. Start with BloodHound to map the environment before attempting individual techniques.

| Technique | Entry Point |
|---|---|
| [ASREPRoasting](asrep-roasting.md) | No credentials required |
| [Kerberoasting](kerberoasting.md) | Valid domain credentials |
| [ACL Abuse](acl-abuse.md) | Misconfigured object permissions |
| [DCSync](dcsync.md) | Replication rights on domain object |
| [Silver / Golden Tickets](silver-golden-tickets.md) | Service or krbtgt hash |
| [Persistence](persistence.md) | Post-DA access |
