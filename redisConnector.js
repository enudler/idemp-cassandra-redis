const { Redis } = require('redis-client');


let redisConnector;

async function init() {
  if (!redisConnector) {
    const options = buildRedisOptions();
    redisConnector = await Redis.init(options);
    await redisConnector.flushall();
    await healthCheck();
  }
}

function buildRedisOptions() {
  const options = {
    dev_mode: true,
    host: 'localhost',
    port: 6379
  };

  return options;
}

async function getIdempRecordOrCreateOne(key) {
  let response;
  const isRecordExists = await redisConnector.hsetnx(key, 'in_progress', true);
  if (isRecordExists === 0) {
    response = await redisConnector.hgetall(key);
    response.in_progress = (response.in_progress === 'true');
  }
  return response;
}

async function updateIdempRecord(key, response) {
  await redisConnector.hset(key, 'in_progress', false);
  await redisConnector.hset(key, 'response', response);
}

async function getIdempRecord(key) {
  const record = await redisConnector.hgetall(key);
  return record;
}

async function healthCheck() {
    const response = await redisConnector.healthCheck();
    if (response === 'OK') {
      return {
        status: 'OK'
      };
    }
}

module.exports = {
  init: init,
  getIdempRecordOrCreateOne,
  updateIdempRecord,
  getIdempRecord,
  healthCheck: healthCheck
};
