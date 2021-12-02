const cassandra = require('cassandra-driver');

let client;

async function init() {
  if (!client) {
    const options = {
      contactPoints: ['localhost:9042']
    };
    client = new cassandra.Client(options);
    await createKeySpaceIfNeeded(client);
    options.keyspace = 'idemp';
    client = new cassandra.Client(options);
    await createTable(client);
    await truncateTable(client);
  }
}

function createKeySpaceIfNeeded(client) {
  const CREATE_KEY_SPACE_QUERY = "CREATE KEYSPACE IF NOT EXISTS idemp WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}";
  return new Promise(function(resolve, reject) {
    client.execute(CREATE_KEY_SPACE_QUERY, null, { prepare: true }, function(err) {
      if (err) {
        reject(err);
      } else {
        console.log('keyspace created');
        resolve();
      }
    });
  });
}

function createTable(client) {
  const CREATE_TABLE_QUERY = 'CREATE TABLE IF NOT EXISTS idemp (\n' +
        '  key text PRIMARY KEY,\n' +
        '  in_progress boolean,\n' +
        '  response text\n' +
        ');';
  return new Promise(function(resolve, reject) {
    client.execute(CREATE_TABLE_QUERY, null, { prepare: true }, function(err) {
      if (err) {
        reject(err);
      } else {
        console.log('table created');
        resolve();
      }
    });
  });
}

function truncateTable(client) {
  const TRUNC_TABLE_QUERY = 'truncate table idemp';
  return new Promise(function(resolve, reject) {
    client.execute(TRUNC_TABLE_QUERY, null, { prepare: true }, function(err) {
      if (err) {
        reject(err);
      } else {
        console.log('table created');
        resolve();
      }
    });
  });
}

async function getIdempRecordOrCreateOne(key) {
  const response = await getIdempRecord(key);
  if (!response) {
    await storeIdempInProgress(key);
  }
  return response;
}

async function getIdempRecord(key) {
  return new Promise(function(resolve, reject) {
    client.execute('SELECT * from idemp where key = ?', [key.toString()], { prepare: true }, function(err, rows) {
      if (err) {
        reject(err);
      } else {
        resolve(rows.rows[0]);
      }
    });
  });
}

async function storeIdempInProgress(key) {
  return new Promise(function(resolve, reject) {
    client.execute('INSERT INTO idemp(key, in_progress) values (?,?)', [key.toString(), true], { prepare: true }, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function updateIdempRecord(key, response) {
  return new Promise(function(resolve, reject) {
    client.execute('UPDATE idemp SET in_progress = ?, response = ? where key=? ', [false, response.toString(), key.toString()], { prepare: true }, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  init: init,
  getIdempRecordOrCreateOne,
  getIdempRecord,
  updateIdempRecord,
  healthCheck: () => {
  }
};
