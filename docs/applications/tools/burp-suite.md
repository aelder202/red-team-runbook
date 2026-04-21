# Burp Suite

!!! tip "Tip"
    Repeater keyboard shortcuts save significant time: Ctrl+R to send to Repeater, Ctrl+Space to re-send, Ctrl+Shift+U to URL-decode selected text.

| Task | Burp feature |
|---|---|
| Intercept and modify a request once | Proxy → Intercept |
| Replay and tweak a request repeatedly | Send to Repeater (Ctrl+R) |
| Fuzz a parameter with a wordlist | Send to Intruder → Sniper mode |
| Scan for common web vulns automatically | Scanner (Pro only) |
| Test CSRF token bypass | Proxy → Match and Replace |
| Compare two responses | Comparer |

---

## Adding Cookies to Every Request

1. `Burp > Settings > Sessions > Session handling rules > Add`
2. Add a rule in the Details tab → `Set a specific cookie or parameter value`
    - `Name: COOKIE`
    - `value: VALUE`
    - Check box `if not already present, add as a: cookie`
3. In the Scope tab, select all Tools scope and the URL scope

---

## Sorting Intruder Payloads

When configuring an Intruder attack, send the payload through Repeater first to see the expected or errored response. Use `grep match` in Intruder settings to filter by this HTTP response if present.
