---
title: Operator Workflow
description: A repeatable decision model for moving from reconnaissance signals to verified, documented impact during an authorized security assessment.
---

# Operator Workflow

The runbook is most useful when it helps answer one question: **what does this result make possible next?** Use this page to move through an assessment without losing the reasoning behind each command.

!!! warning "Authorization comes first"
    Confirm the target, scope, test window, prohibited actions, data-handling rules, and escalation contacts before touching the environment. A technically valid test can still be out of scope.

## The decision loop

| Step | Question | Output |
|---|---|---|
| **1. Scope** | What am I authorized to test, and what could cause harm? | Constraints and stop conditions |
| **2. Observe** | What is the smallest useful signal I can collect? | Evidence, not assumptions |
| **3. Prioritize** | Which hypothesis has the best value-to-risk ratio? | A deliberate next action |
| **4. Act** | What controlled test will confirm or reject it? | A reproducible result |
| **5. Verify** | Did the result prove impact, and what changed? | Evidence, cleanup, and next decision |

Repeat the loop whenever the environment gives you a new identity, host, service, trust relationship, or application behavior.

## Start from your current state

### I have a target

1. Establish live hosts and exposed ports with [Network Scanning](network-scanning/network-scanning.md).
2. Use [Reconnaissance](network-scanning/reconnaissance.md) to build context around names, technologies, and trust boundaries.
3. Move each confirmed port into the matching [service playbook](information-gathering/index.md).
4. Record what was tested, what responded, and what is still unknown.

**Decision point:** prioritize services that expose authentication, administrative interfaces, sensitive data, or trust relationships.

### I found a service

1. Confirm the protocol and version before running broad enumeration.
2. Start with low-impact, unauthenticated checks.
3. If credentials are available, validate the smallest safe action first.
4. Follow service-specific signals into application, exploitation, or credential workflows.

Useful starting points include [SMB](information-gathering/service-analysis/smb.md), [HTTP/HTTPS](information-gathering/service-analysis/http-80-443.md), [LDAP](information-gathering/service-analysis/ldap.md), [Kerberos](information-gathering/service-analysis/kerberos-88.md), and [SSH](information-gathering/service-analysis/ssh-22.md).

**Decision point:** a banner is context, not proof. Prefer behavior you can reproduce and explain.

### I have credentials

1. Pull the password and lockout policy before any spray or repeated authentication attempt.
2. Validate the identity against one known target before expanding scope.
3. Determine whether access is local, domain, application, or service-specific.
4. Map group membership, reachable systems, and effective privilege.
5. Use [NetExec](tools/netexec.md), [BloodHound](tools/bloodhound.md), or the relevant protocol page to identify the next controlled check.

**Decision point:** valid credentials are a new observation, not permission to authenticate everywhere.

### I have a foothold

1. Run [Situational Awareness](privilege-escalation/situational-awareness.md) before dropping additional tooling.
2. Identify the host role, current identity, security controls, network position, and accessible secrets.
3. Choose the relevant [Linux](privilege-escalation/linux/index.md) or [Windows](privilege-escalation/windows/index.md) escalation path.
4. Treat new credentials or trust relationships as a fresh decision loop.
5. Record modified files, processes, services, accounts, and configuration so they can be cleaned up.

**Decision point:** prefer the least destructive technique that proves the required impact.

## Keep a decision record

Copy this block into your assessment notes whenever a result changes the path:

```text
Observation:
Evidence:
Hypothesis:
Proposed action:
Expected signal:
Operational risk:
Result:
Next decision:
Cleanup required:
```

This creates a defensible chain from raw output to validated impact and makes the final report much easier to write.

## Definition of done

A technique is not finished when the command succeeds. It is finished when:

- The result is reproducible and tied to an in-scope asset.
- The security impact is explained in business or operational terms.
- Evidence is captured without retaining unnecessary sensitive data.
- Any changed state is restored or clearly handed off.
- The next decision, or the reason to stop, is documented.

