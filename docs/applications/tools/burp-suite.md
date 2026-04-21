Burp Suite is a web vulnerability scanner and penetration testing tool used for intercepting, modifying, and analyzing web traffic. It is commonly used for testing web application security.
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