# Red Team Runbook

An operator-focused offensive security reference for moving from first signal to verified impact across web, network, and Active Directory assessments.

**[Explore the live runbook](https://taylorelder.com/red-team-runbook/)** · **[View Taylor Elder's portfolio](https://taylorelder.com)**

## Why this exists

Commands are easy to collect and hard to use well. This project turns repeated assessment and lab notes into workflows that answer the questions that matter during an authorized test:

- What does the current signal actually prove?
- What is the smallest safe action that can confirm the next hypothesis?
- How should the result change the assessment path?
- What evidence and cleanup are required when the test is complete?

The runbook is maintained as a field reference for fast recall without hiding the reasoning behind each technique.

## At a glance

| Coverage | Current scope |
|---|---:|
| Reference pages | 118+ |
| Service playbooks | 30 |
| Command examples | 1,000+ |
| Primary domains | Web, network, Active Directory |

## Start with what you have

| Current state | Recommended entry point |
|---|---|
| A target or subnet | [Enumeration](docs/enumeration/index.md) |
| An open service | [Service analysis](docs/information-gathering/index.md) |
| A web application | [Application testing](docs/applications/index.md) |
| Valid credentials | [NetExec workflows](docs/tools/netexec.md) |
| A shell or foothold | [Situational awareness](docs/privilege-escalation/situational-awareness.md) |

The complete [operator workflow](docs/workflow.md) uses a five-step decision loop: **scope → observe → prioritize → act → verify**.

## Coverage

- **Enumeration:** host discovery, network scanning, traffic capture, and screenshots
- **Services:** protocol-specific enumeration for 30 common services
- **Applications:** enumeration, authentication testing, web exploits, and tooling
- **Exploitation:** shells, credential attacks, and binary exploitation
- **Privilege escalation:** Linux, Windows, and Active Directory paths
- **Post-exploitation:** lateral movement, persistence, exfiltration, and tunneling
- **Tools:** operational notes for BloodHound, Impacket, NetExec, Mimikatz, and more

## Project standards

High-value pages are being standardized around objectives, prerequisites, low-impact starting checks, expected signals, decision points, operational risk, verification, cleanup, and authoritative references.

Repository checks currently validate:

- Internal Markdown links
- Navigation coverage
- One H1 per page
- Common editorial mistakes
- Encoding problems
- Strict MkDocs builds

Read [About & Standards](docs/about.md) for provenance, editorial expectations, and project boundaries.

## Local development

The project is built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

```bash
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

python -m pip install --require-hashes -r requirements.lock
python scripts/content_audit.py
mkdocs serve
```

Open `http://127.0.0.1:8000/red-team-runbook/` to view the local site.

Run the production build with:

```bash
mkdocs build --strict
```

## Deployment

Pushes to `main` run the content audit and strict MkDocs build before GitHub Pages deployment. Workflow actions are pinned to full commit hashes and Python dependencies are installed from a hash-locked requirements file.

## Responsible use

This material is intended for systems you own, deliberately vulnerable labs, or environments where you have explicit authorization to perform security testing. Confirm scope, test windows, prohibited actions, data-handling requirements, and cleanup expectations before using any technique.

The public repository does not contain client-identifying data, private targets, credentials, proprietary findings, or confidential assessment evidence.

## Author

Built and maintained by [Taylor Elder](https://taylorelder.com), a penetration tester focused on application, API, network, and Active Directory security testing.
