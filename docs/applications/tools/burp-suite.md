| Task | Burp feature |
|---|---|
| Intercept and modify a request once | Proxy → Intercept |
| Replay and tweak a request repeatedly | Send to Repeater (Ctrl+R) |
| Fuzz a parameter with a wordlist | Send to Intruder → Sniper mode |
| Scan for common web vulns automatically | Scanner (Pro only) |
| Test CSRF token bypass | Proxy → Match and Replace |
| Compare two responses | Comparer |

!!! tip "Tip"
    Repeater keyboard shortcuts save significant time: Ctrl+R to send to Repeater, Ctrl+Space to re-send, Ctrl+Shift+U to URL-decode selected text.

## Adding cookies (or other params) to every request

* `Burp > Settings > Sessions > Session handling rules > Add`
* `Add` a rule in the Details tab > `Set a specific cookie or parameter value`
	* `Name:COOKIE`
	* `value:VALUE`
	* Check box `if not already present, add as a: cookie`
* In the Scope tab, select all Tools scope and the URL scope

> Lab reference [Imagery](Imagery.md#^hvdyrl)

## Sorting Intruder Payloads
When configuring an intruder attack, send the payload through Repeater first to see the expected, or errored, response. Use `grep match` in Intruder settings to filter by this HTTP response if present. 
