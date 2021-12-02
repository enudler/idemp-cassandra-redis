const client = require('./payments');
const NUMBER_OF_PAYMENTS_TO_CREATE = 10;

async function createDoublePayments() {
  const promises = [];
  for (let i = 0; i < NUMBER_OF_PAYMENTS_TO_CREATE / 2; i++) {
    promises.push(client.postPayment(i));
    promises.push(client.postPayment(i));
  }
  const responses = await Promise.all(promises);
  for (let i = 0; i < NUMBER_OF_PAYMENTS_TO_CREATE; i += 2) {
    console.log(i + ' : ' + responses[i] + ' : ' + responses[i + 1]);
    if (responses[i] != responses[i + 1]) {
      console.log('Failure!!!!');
    }
  }
}

async function doWork() {
  console.log('starting test cassandra');

  let connector = require('./cassandraConnector');
  console.log('doing 1st cassandra test to proof that double requests cause different responses');
  await client.init(connector);
  await createDoublePayments();
  console.log('doing 2nd cassandra test to proof that after a wait, the idemptoency is fine');
  await createDoublePayments();

  console.log('starting test redis');

  connector = require('./redisConnector');
  console.log('doing 1st redis test to proof that double requests cause same responses');
  await client.init(connector);
  await createDoublePayments();
  console.log('מ.ש.ל')
}

doWork()
