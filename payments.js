module.exports = {
  init, postPayment
};
let client;
async function init(connector) {
  client = connector;
  await client.init();
  const health = await client.healthCheck();
  console.log(health);
}

async function postPayment(i) {
  let response;

  // Get idemp record, or create one to fix parallel requests
  const idempResponse = await client.getIdempRecordOrCreateOne(i);
  // If the request is in progress. need wait for it to finish before returning response
  if (idempResponse && idempResponse.in_progress === true) {
    response = await waitForOtherRequestResponse(i);
    // If the original request finished, return the original response
  } else if (idempResponse && idempResponse.in_progress === false) {
    response = idempResponse.response;
  } else {
    // Mimic a request which takes few ms
    await new Promise(resolve => setTimeout(resolve, getRandomInt(5)));
    response = getRandomInt(9999999);
    // Mark idemp record with the response
    await client.updateIdempRecord(i, response);
  }
  return response;
}

async function waitForOtherRequestResponse(i) {
  let response;
  while (!response) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    const idempRecord = await client.getIdempRecord(i);
    if (idempRecord !== null && !idempRecord.in_progress === false && idempRecord.response) {
      response = idempRecord.response;
    }
  }
  return response;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
