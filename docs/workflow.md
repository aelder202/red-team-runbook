---
title: Operator Workflow
description: A practical path through target discovery, service enumeration, credential validation, host access, evidence collection, and cleanup.
---

# Operator Workflow

Use this page when you know what you have and need to decide where to go next. Start with the section that matches your current access.

!!! warning "Check scope before testing"
    Confirm the targets, testing window, prohibited actions, data-handling requirements, and escalation contacts. Stop and ask when the rules of engagement do not clearly cover an action.

## Before each test

- Confirm the target is in scope.
- Separate what you observed from what you assume.
- Use the lowest-impact check that will answer the question.
- Know what the command changes and how you will clean it up.

## You have a target

1. Use [Enumeration](enumeration/index.md) for TCP/UDP scans and the first checks on each service. Use [Network Scanning](enumeration/network-scanning.md) for scan commands.
2. Use [Reconnaissance](enumeration/reconnaissance.md) for DNS, ownership, technology, and other supporting context.
3. Take each confirmed service to the matching [service playbook](information-gathering/index.md).
4. Save the scan output and note anything that was excluded, filtered, or left untested.

Prioritize authentication services, administrative interfaces, exposed data, and systems that define trust boundaries.

## You found a service

1. Confirm the protocol and version before running service-specific tooling.
2. Start with read-only and unauthenticated checks where possible.
3. Use credentials only after checking the account type, lockout policy, and rules of engagement.
4. Record the request, response, and tool options needed to reproduce the result.

Common starting points: [SMB](information-gathering/service-analysis/smb.md), [HTTP/HTTPS](information-gathering/service-analysis/http-80-443.md), [LDAP](information-gathering/service-analysis/ldap.md), [Kerberos](information-gathering/service-analysis/kerberos-88.md), and [SSH](information-gathering/service-analysis/ssh-22.md).

A banner or version match is a lead. Verify the behavior before treating it as a finding.

## You have credentials

1. Identify what you have: a local or domain password, hash, key, token, or application account.
2. Check password and lockout policy before spraying or making repeated authentication attempts.
3. Test one known service first and confirm the identity you reached.
4. Enumerate group membership, effective permissions, accessible data, and reachable systems.
5. Expand authentication attempts only when the scope and account-safety controls allow it.

Use [NetExec](tools/netexec.md), [BloodHound](tools/bloodhound.md), or the relevant service playbook for the next check. Valid credentials do not automatically justify authentication across the environment.

## You have a shell

1. Run [Situational Awareness](privilege-escalation/situational-awareness.md) before transferring additional tooling.
2. Record the current user, hostname, operating system, host role, network interfaces, and security controls.
3. Continue with the appropriate [Linux](privilege-escalation/linux/index.md) or [Windows](privilege-escalation/windows/index.md) privilege-escalation checks.
4. Track every file, process, service, account, or configuration change you make.
5. Treat any new credential, host, or trust relationship as a new starting point in the workflow.

Prefer the least disruptive technique that demonstrates the issue you need to report.

## Keep useful notes

Capture enough detail to reproduce the result and clean up after the test:

```text
Time:
Target:
Identity:
Observation:
Command or request:
Result:
Next step:
Changes and cleanup:
```

Before moving on, make sure the evidence is saved, changed state is accounted for, and the next action—or the reason for stopping—is clear.
