# BloodHound — AD Attack Path Mapping

!!! tip "Tip"
    After importing SharpHound data, run these queries immediately: "Shortest Paths to Domain Admins", "Find AS-REP Roastable Users", "Find Kerberoastable Users with Most Privileges". These cover 80% of HTB AD paths.

!!! warning "BloodHound CE vs Legacy"
    BloodHound Community Edition (CE) is the actively maintained version — runs via Docker Compose and exposes a web UI at `http://localhost:8080`. Legacy BloodHound (Electron app + local Neo4j) is no longer updated. Use CE on new installs: `curl -L https://ghst.ly/getbhce -o docker-compose.yml && docker compose up -d`. SharpHound and bloodhound-python data work with both — the collectors are unchanged.

---
## SharpHound Data Collection

### Setup (.ps1)

```bash
powershell -ep bypass
Import-Module .\Sharphound.ps1
```

```bash
Invoke-BloodHound -CollectionMethod All -OutputDirectory C:\Temp\ -OutputPrefix "TARGET"
```

- Update `-OutputDirectory` to the path where SharpHound is located
- Update `-OutputPrefix` to the target name — output file will be named `TARGET_<id>.zip`

### Setup (.exe)

```cmd
SharpHound.exe -c all,gpolocalgroup
```

### Focused (Stealthier) Collections

```cmd
SharpHound.exe -c Session,LocalAdmin,ObjectProps
```

Use this when attempting to stay low-noise in a monitored environment.

### Output

Once SharpHound completes, a zip file is created in the specified directory. Download it to import into BloodHound.

---
## BloodHound UI

### Python Collection (from Kali)

No binary drop needed on target — runs over the network:

```bash
bloodhound-python -c All -d example.com -ns 10.10.10.10 -u <user> -p <pass> --zip

# Authenticated via NTLM hash
bloodhound-python -c All -d example.com -ns 10.10.10.10 -u <user> --hashes :<ntlm-hash> --zip

# Via NetExec (writes .zip to current dir)
nxc ldap 10.10.10.10 -u <user> -p <pass> --bloodhound --collection All --dns-server 10.10.10.10
```

### Start BloodHound CE

```bash
docker compose up -d    # from the CE install directory
# then browse to http://localhost:8080 (default creds shown by docker on first run)
```

### Upload Collection Data

In the CE UI, navigate to:

```
http://localhost:8080/ui/administration/file-ingest
```

Click `Upload File(s)` and drop in the SharpHound/bloodhound-python zip.

---
## Common Abuse Paths Mapped by BloodHound

| Technique | Description | Tools to Use |
|---|---|---|
| ACL Abuse | Exploit GenericWrite/All permissions on users/groups | PowerView, SharpHound |
| GPO Abuse | Edit group policy on target OUs | Gptpwnt.py |
| Kerberoasting | Request and crack SPNs to recover service account creds | Rubeus, Impacket |
| AS-REP Roasting | Crack accounts without preauth | GetNPUsers.py |
| Constrained Delegation | Abuse s4u2proxy for impersonation | Rubeus, Impacket |
| Unconstrained Delegation | Steal TGT from LSASS on a machine with unconstrained delegation | Rubeus, Mimikatz |
| Shadow Credentials | Add `altSecurityIdentities` attribute | Whisker |
| Resource-Based Constrained Delegation | Abuse msDS-AllowedToActOnBehalfOfOtherIdentity | Impacket, PowerView |

---
## Practical BloodHound Usage Tips

- Run BloodHound collection immediately after first internal access to avoid manual recon.
- Use focused collection flags to minimize detection on monitored networks.
- Combine BloodHound output with NetExec and Rubeus to execute the full attack path.
- Export query results for audit trails or reporting.
- Clean up `SharpHound.exe` and the zip output from disk post-collection.

Example cleanup:

```bash
nxc smb 10.10.10.10 -u <user> -p <pass> --exec "del C:\Temp\SharpHound.exe"
nxc smb 10.10.10.10 -u <user> -p <pass> --exec "del C:\Temp\data.zip"
```

---
## Post-Access BloodHound Workflow

1. Compromise a host inside the domain
2. Upload and run SharpHound for collection
3. Exfiltrate the data
4. Load into BloodHound and analyze attack paths
5. Identify shortest paths to Domain Admin or privileged access
6. Execute lateral movement or escalation using NetExec, Rubeus, or Impacket
7. Clean up all binaries and collection artifacts
