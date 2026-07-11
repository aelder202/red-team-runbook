---
title: About & Standards
description: Project scope, provenance, maintenance practices, and responsible-use boundaries for the Red Team Runbook.
---

# About the Runbook

The Red Team Runbook is a public working reference maintained by [Taylor Elder](https://taylorelder.com). It turns repeated assessment and lab notes into a searchable set of workflows for web, network, Active Directory, exploitation, privilege escalation, and post-exploitation work.

## What this project demonstrates

- Organizing a large offensive-security knowledge base around operator decisions.
- Translating tool output into follow-on checks instead of collecting commands without context.
- Maintaining coverage across applications, infrastructure, Windows, Linux, and Active Directory.
- Treating scope, verification, evidence, and cleanup as part of the technical workflow.

## Content provenance

The runbook combines three kinds of material:

| Source | Meaning |
|---|---|
| **Professional practice** | General methods and lessons retained from authorized application and API assessment work, without client-identifying data |
| **Lab practice** | Techniques exercised in HackTheBox, GOAD, and isolated test environments |
| **Technical research** | Commands and behaviors documented from authoritative tool documentation and security research |

The public content does not contain client names, private targets, credentials, proprietary findings, or confidential assessment evidence.

## Editorial standard

High-value playbooks should answer more than “what command do I run?” As pages are reviewed, they are being standardized around:

1. Objective and prerequisites
2. Low-impact starting checks
3. Commands with meaningful placeholders
4. Expected signals and interpretation
5. Decision points and follow-on actions
6. Operational risk, detection, and stop conditions
7. Verification and cleanup
8. Authoritative references and review status

Automated checks validate internal links, navigation coverage, common editorial mistakes, and encoding before the site is built.

## Responsible use

This material is intended for systems you own, deliberately vulnerable labs, or environments where you have explicit authorization to perform security testing. The presence of a technique in the runbook does not make it appropriate for every engagement.

Before use, confirm:

- Written authorization and exact target scope
- Testing window and communication path
- Prohibited or disruptive actions
- Credential and sensitive-data handling requirements
- Evidence retention and cleanup expectations

## Project boundaries

This is a working reference, not a guarantee that every command applies to every tool version or environment. Tool behavior changes. Validate syntax against current upstream documentation and test potentially disruptive actions in a controlled environment first.

Questions or corrections can be opened through the [GitHub repository](https://github.com/aelder202/red-team-runbook).

