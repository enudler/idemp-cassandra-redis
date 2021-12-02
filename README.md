# idemp-cassandra-redis

## This project demonstrates how redis as opposite to cassandra can avoid duplicate requests sent to distributed system in exactly same time.

### Needed dockers
```
docker run -p 6379:6379  --name some-redis -d redis
docker run -p 9042:9042 --name some-cassandra -d cassandra:3
```

### How to run

* npm install
* startup the above dockers
* node index.js
