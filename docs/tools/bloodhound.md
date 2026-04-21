# BloodHound — Active Directory Attack Path Mapping

## References
https://m4lwhere.medium.com/the-ultimate-guide-for-bloodhound-community-edition-bhce-80b574595acf

!!! tip "Tip"
    After importing SharpHound data, run these queries immediately: "Shortest Paths to Domain Admins", "Find AS-REP Roastable Users", "Find Kerberoastable Users with Most Privileges". These cover 80% of HTB AD paths.

---
## SharpHound Data Collection

**[SharpHound](https://github.com/SpecterOps/SharpHound/releases)** is the official ingestor used to collect Active Directory data for BloodHound. It is executed from a host inside the domain (e.g., compromised Windows system) and will be the first step in setting up BloodHound.
## Setup (.ps1)

Download the latest release of [SharpHound](https://github.com/SpecterOps/SharpHound/releases) onto kali. Next, start a python server and upload to the target - or use a variety of other methods to upload. 
```bash
powershell -ep bypass
Import-Module .\Sharphound.ps1
```

And now we're ready to run:
```bash
Invoke-BloodHound -CollectionMethod All -OutputDirectory C:\Users\taylor\Desktop\ -OutputPrefix "TARGET"
```

* Update the `-OutputDirectory` to the PWD where SharpHound is located
* Update `-OutputPrefix` to the target name. This will make the file name as follows: `TARGET_sdfsdf.zip`
## Setup (.exe)

Download the latest release of [SharpHound](https://github.com/SpecterOps/SharpHound/releases) onto kali. Next, start a python server and upload to the target - or use a variety of other methods to upload. 
```cmd
SharpHound.exe -c all,gpolocalgroup
```

This performs all the following collections:

- `Session`: Identifies where users are logged in
    
- `LocalAdmin`: Lists local admin rights
    
- `Trusts`: Maps domain trusts
    
- `ACL`: Dumps access control lists (useful for privilege escalation)
    
- `ObjectProps`: Gathers metadata on domain objects
    

### Focused (Stealthier) Collections

```cmd
SharpHound.exe -c Session,LocalAdmin,ObjectProps
```

Use this when attempting to stay low-noise in a monitored environment.

## Output

Once SharpHound is completed, a zip file will be created in the specified directory. Download this, or access the network drive, to use on our Windows laptop.

---
## BloodHound UI
### Setup using Kali (Preferred)
**Note:** Kali will only run the older version of BloodHound (can't figure out the docker issue) which requires the older version of SharpHound, or equivalent data collector!

First, run the collection using the appropriate collector:

```bash
bloodhound-python -c all,Group,Session,DCOM,RDP,PSRemote,LoggedOn,Container,ObjectProps,ACL -d "nagoya-industries.com" -ns 192.168.177.21 -v -u Andrea.Hayes -p Nagoya2023 --zip  
```

Next, use the following commands to start BloodHound:
```bash
sudo neo4j start 
bloodhound
```
### Setup using Docker (Windows)
To begin, we'll be using the Windows host laptop rather than the kali VM due to issues with `docker-compose`.

First, **make sure Docker Desktop is up and running**.

Next, CD into the appropriate directory which hosts the `docker-compose.yml` [file](https://raw.githubusercontent.com/SpecterOps/BloodHound/refs/heads/main/examples/docker-compose/docker-compose.yml):
```powershell
cd C:\Users\taylo\docker\BloodHound
curl.exe -L https://ghst.ly/getbhce | docker compose -f - up
```

During setup, you should see an info message with the phrase below:
```
Initial Password Set To: ....
```

Once the setup is completed, navigate to the following URL:
```
http://localhost:8080
```

Use `admin` as the username and the password set in setup to log in.
**Note:** The password should only be set during initial update. Check vault for login.
### Uploading SharpHound Collection (File Ingest)
Begin by navigating to the following URL:
```
http://localhost:8080/ui/administration/file-ingest
```

Next, choose `Upload File(s)` and select the zip file created from the SharpHound collection section.

### Analyzing File Ingest - Shortest Path Queries
Below is an extremely useful example of how to query the collection data. BloodHound will find the shortest path to a specific destination, for example DA. This will reveal privileges to user accounts, for computers in the domain, and much more. 

![[Pasted image 20250404154133.png]]

---
## Common Abuse Paths Mapped by BloodHound

|Technique|Description|Tools to Use|
|---|---|---|
|ACL Abuse|Exploit GenericWrite/All permissions on users/groups|PowerView, SharpHound|
|GPO Abuse|Edit group policy on target OUs|Gptpwnt.py|
|Kerberoasting|Request and crack SPNs to recover service account creds|Rubeus, Impacket|
|AS-REP Roasting|Crack accounts without preauth|GetNPUsers.py|
|Constrained Delegation|Abuse s4u2proxy for impersonation|Rubeus, Impacket|
|Unconstrained Delegation|Steal TGT from LSASS on a machine with unconstrained del|Rubeus, Mimikatz|
|Shadow Credentials|Add `altSecurityIdentities` attribute|Whisker|
|Resource-Based Constrained Delegation|Abuse msDS-AllowedToActOnBehalfOfOtherIdentity|Impacket, PowerView|

---
## Practical BloodHound Usage Tips

- Run BloodHound collection **immediately after first internal access** to avoid manual recon.
    
- Use focused collection flags to minimize detection on monitored networks.
    
- Combine BloodHound output with tools like NetExec and Rubeus to execute the full attack path.
    
- Export query results for audit trails or reporting.
    
- Clean up `SharpHound.exe` and the zip output from disk post-collection to minimize forensic evidence.
    

Example cleanup:

```bash
nxc smb <target_ip> -u <user> -p <pass> --exec "del C:\Temp\SharpHound.exe"
nxc smb <target_ip> -u <user> -p <pass> --exec "del C:\Temp\data.zip"
```

---
## Summary: Post-Access BloodHound Workflow

1. Compromise a host inside the domain
    
2. Upload and run SharpHound for collection
    
3. Exfiltrate the data
    
4. Load it into BloodHound and analyze attack paths
    
5. Identify shortest paths to Domain Admin or privileged access
    
6. Execute lateral movement or escalation using NetExec, Rubeus, or Impacket
    
7. Clean up all binaries and collection artifacts
