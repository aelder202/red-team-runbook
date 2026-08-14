---
title: About & Standards
description: Scope, sources, writing standards, and responsible-use boundaries for the Red Team Runbook.
---

# About the Runbook

The Red Team Runbook is a working reference maintained by [Taylor Elder](https://taylorelder.com). It keeps frequently used commands, enumeration checks, and follow-up actions in one place for network, web application, Active Directory, privilege-escalation, and post-exploitation work.

## What belongs here

- Commands and tool syntax used repeatedly during assessments.
- Service-specific enumeration and validation checks.
- Short workflows that help move from a result to the next test.
- Notes about prerequisites, side effects, evidence, and cleanup.

The goal is quick access during an engagement. Longer explanations stay only when they help choose or safely run a technique.

## Sources and testing

The material comes from authorized assessment experience, isolated labs, upstream tool documentation, and published security research. Client names, targets, credentials, findings, and assessment evidence are not included.

Commands are checked against current documentation and tested in a lab when practical. Tool syntax and behavior change, so confirm the installed version before using an example in an engagement.

## Writing standard

Pages should:

- Lead with the command or check an operator is likely to need.
- Explain when to use it and what result matters.
- Distinguish enumeration from actions that authenticate, exploit, or change state.
- Use consistent placeholders such as `$IP`, `$SUBNET`, `$LHOST`, `$DOMAIN`, and `$DC_IP`.
- Keep alternate tools and detailed background on the relevant playbook instead of duplicating them across the site.
- Link to primary documentation when behavior or syntax needs confirmation.

## Responsible use

Use this material only on systems you own, intentionally vulnerable labs, or environments where you have explicit authorization to perform security testing.

Before testing, confirm:

- The exact targets and testing window.
- Prohibited or disruptive actions.
- Credential and sensitive-data handling requirements.
- Communication and escalation contacts.
- Evidence-retention and cleanup expectations.

A command being listed here does not make it appropriate for every engagement.

## Corrections

If a command is outdated, unsafe as written, or missing important context, open an issue or pull request in the [GitHub repository](https://github.com/aelder202/red-team-runbook).

<a class="md-button runbook-tour-replay" href="../?tour=1">Replay quick introduction</a>
