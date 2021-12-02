const { Redis } = require('redis-client');
const loggerHelper = require('logger-helper');

const logger = loggerHelper.createLogger({
  name: 'idemp'
});

module.exports = logger;

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
    logger: logger,
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
  logger.trace(`redis hgetall record, key: ${key}`);
  const record = await redisConnector.hgetall(key);
  logger.trace(`redis get record for key: ${key}`);
  return record;
}

async function healthCheck() {
  try {
    const response = await redisConnector.healthCheck();
    if (response === 'OK') {
      return {
        status: 'OK'
      };
    }
  } catch (error) {
    logger.warn(error, 'HealthCheck to redis failed');
  }
}

module.exports = {
  init: init,
  getIdempRecordOrCreateOne,
  updateIdempRecord,
  getIdempRecord,
  healthCheck: healthCheck
};
