---
description: An operator-focused offensive security reference for moving from first signal to verified impact across web, network, and Active Directory assessments.
hide:
  - toc
---

<div class="runbook-home" markdown>

<section class="runbook-hero" markdown>

<div class="runbook-hero__copy">
<p class="runbook-eyebrow">OFFENSIVE SECURITY / OPERATOR REFERENCE</p>
<h1>From first signal to<br><span>verified impact.</span></h1>
<p class="runbook-hero__lede">A working field reference for web, network, and Active Directory assessments, organized around what you know, what to verify, and what to try next.</p>
<div class="runbook-actions">
<a class="md-button md-button--primary" href="workflow/">Start with what you have</a>
<a class="md-button" href="information-gathering/">Browse services</a>
</div>
</div>

<div class="runbook-terminal" aria-label="Runbook workflow preview">
<div class="runbook-terminal__bar">
<span></span><span></span><span></span>
<small>operator@runbook</small>
</div>
<div class="runbook-terminal__body">
<code><span class="prompt">$</span> runbook --start</code>
<code><span class="muted">signal</span> <span class="arrow">→</span> validate <span class="arrow">→</span> act</code>
<code><span class="muted">result</span> <span class="arrow">→</span> verify <span class="arrow">→</span> document</code>
<code>&nbsp;</code>
<code><span class="label">scope</span> web · network · active directory</code>
<code><span class="label">mode</span> authorized testing only</code>
<code><span class="success">ready</span> choose your starting signal_</code>
</div>
</div>

</section>

<section class="runbook-proof" aria-label="Runbook coverage">
  <div><strong>118+</strong><span>reference pages</span></div>
  <div><strong>30</strong><span>service playbooks</span></div>
  <div><strong>1,000+</strong><span>command examples</span></div>
  <div><strong>4</strong><span>assessment phases</span></div>
</section>

<section class="runbook-section" markdown>

<p class="runbook-kicker">CHOOSE YOUR ENTRY POINT</p>
## Start with what you have

The runbook is designed for the moment after a new signal appears. Pick the state that matches your assessment and move into a focused workflow.

<div class="runbook-entry-grid">

<a class="runbook-entry-card" href="network-scanning/network-scanning/">
  <span class="runbook-entry-card__number">01</span>
  <span class="runbook-entry-card__icon" aria-hidden="true">◎</span>
  <strong>I have a target</strong>
  <small>Build the attack surface, identify live services, and capture the first useful signals.</small>
  <span class="runbook-entry-card__link">Begin reconnaissance <b>→</b></span>
</a>

<a class="runbook-entry-card" href="information-gathering/">
  <span class="runbook-entry-card__number">02</span>
  <span class="runbook-entry-card__icon" aria-hidden="true">▤</span>
  <strong>I found a service</strong>
  <small>Move from an open port to protocol-specific enumeration, authentication checks, and next steps.</small>
  <span class="runbook-entry-card__link">Choose a service <b>→</b></span>
</a>

<a class="runbook-entry-card" href="tools/netexec/">
  <span class="runbook-entry-card__number">03</span>
  <span class="runbook-entry-card__icon" aria-hidden="true">◇</span>
  <strong>I have credentials</strong>
  <small>Validate access safely, understand privilege, and map where the identity can take you.</small>
  <span class="runbook-entry-card__link">Validate access <b>→</b></span>
</a>

<a class="runbook-entry-card" href="privilege-escalation/situational-awareness/">
  <span class="runbook-entry-card__number">04</span>
  <span class="runbook-entry-card__icon" aria-hidden="true">&gt;_</span>
  <strong>I have a foothold</strong>
  <small>Establish situational awareness, prioritize escalation paths, and prepare for movement.</small>
  <span class="runbook-entry-card__link">Triage the host <b>→</b></span>
</a>

</div>

</section>

<section class="runbook-section runbook-section--method" markdown>

<div class="runbook-section-heading">
  <div>
    <p class="runbook-kicker">THE OPERATING MODEL</p>
    <h2>Commands support decisions</h2>
  </div>
  <p>The useful part of a runbook is not remembering syntax. It is recognizing a signal, choosing the smallest safe action, and knowing what the result changes.</p>
</div>

<div class="runbook-method" aria-label="Runbook operating model">
  <div><span>01</span><strong>Scope</strong><small>Confirm authorization and constraints.</small></div>
  <div><span>02</span><strong>Observe</strong><small>Collect the smallest useful signal.</small></div>
  <div><span>03</span><strong>Prioritize</strong><small>Choose the highest-value hypothesis.</small></div>
  <div><span>04</span><strong>Act</strong><small>Use a controlled, explainable test.</small></div>
  <div><span>05</span><strong>Verify</strong><small>Prove impact, record, and clean up.</small></div>
</div>

[See the complete operator workflow →](workflow.md){ .runbook-text-link }

</section>

<section class="runbook-section" markdown>

<p class="runbook-kicker">REPRESENTATIVE PLAYBOOKS</p>
## Go deeper than the first command

<div class="runbook-feature-grid">

<a class="runbook-feature" href="information-gathering/service-analysis/smb/">
  <span class="runbook-feature__tag">SERVICE / 445</span>
  <strong>SMB: from null sessions to relay paths</strong>
  <small>Enumeration, access validation, share analysis, Kerberos authentication, remote execution, and forced authentication.</small>
  <span>Open playbook →</span>
</a>

<a class="runbook-feature" href="applications/exploits/ssrf/">
  <span class="runbook-feature__tag">WEB / SERVER-SIDE</span>
  <strong>SSRF: confirm, pivot, and bypass</strong>
  <small>Visible and blind validation, cloud metadata targets, internal service discovery, gopher pivots, and filter bypasses.</small>
  <span>Open playbook →</span>
</a>

<a class="runbook-feature" href="tools/bloodhound/">
  <span class="runbook-feature__tag">ACTIVE DIRECTORY</span>
  <strong>BloodHound: turn relationships into paths</strong>
  <small>Focused collection, Community Edition setup, common abuse edges, post-access workflow, and operational cleanup.</small>
  <span>Open playbook →</span>
</a>

</div>

</section>

<section class="runbook-section runbook-section--browse" markdown>

<div class="runbook-section-heading">
  <div>
    <p class="runbook-kicker">FULL COVERAGE</p>
    <h2>Browse by assessment phase</h2>
  </div>
  <p>Use the taxonomy when you already know the technique, platform, or tool you need.</p>
</div>

<div class="runbook-phase-grid" markdown>

- :material-radar: __[Recon](network-scanning/index.md)__

    Scanning, host discovery, screenshots, and traffic capture

- :material-server-network: __[Services](information-gathering/index.md)__

    Thirty protocol-specific enumeration references

- :material-web: __[Applications](applications/index.md)__

    Web enumeration, auth testing, exploits, and tooling

- :material-bug: __[Exploitation](exploitation/index.md)__

    Shells, credential attacks, and binary exploitation

- :material-arrow-up-bold: __[Privilege Escalation](privilege-escalation/index.md)__

    Linux, Windows, and Active Directory paths

- :material-arrow-decision: __[Lateral Movement](lateral-movement/index.md)__

    Windows and Active Directory movement techniques

- :material-key-variant: __[Persistence](persistence/index.md)__

    Linux, Windows, and domain persistence references

- :material-database-export: __[Data Exfiltration](data-exfiltration/index.md)__

    File transfer methods and secure channels

- :material-tunnel: __[Tunneling](port-forwarding/index.md)__

    Port forwarding, Ligolo-ng, Chisel, and SSH

- :material-toolbox: __[Tools](tools/index.md)__

    BloodHound, Impacket, NetExec, Mimikatz, and more

</div>

</section>

<section class="runbook-trust">
  <div>
    <p class="runbook-kicker">BUILT FOR RESPONSIBLE PRACTICE</p>
    <h2>A living reference, with boundaries</h2>
    <p>These notes are shaped by professional application testing, HackTheBox practice, and lab work. They are designed for authorized security assessments, not unsanctioned access.</p>
  </div>
  <div class="runbook-trust__links">
    <a href="about/">How the content is maintained</a>
    <a href="https://github.com/aelder202/red-team-runbook">View the source on GitHub</a>
  </div>
</section>

<footer class="runbook-byline">
  Built and maintained by <a href="https://taylorelder.com">Taylor Elder</a>, penetration tester and offensive-security practitioner.
</footer>

</div>
