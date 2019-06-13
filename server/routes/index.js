const express = require('express');
const router = express.Router();
const dialogflow = require('dialogflow');
const uuid = require('uuid');

async function runSample(utterance) {
  const projectId = 'jarvis-mxdohw';
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: utterance,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
  };


  // Send request and log result
  const toReturn = await sessionClient.detectIntent(request).then((responses) => {
    // console.log('Detected intent');
    const result = responses[0].queryResult;
    // console.log(result);
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
    return result.fulfillmentText;
  });
  return toReturn;

}

router.post('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log("This is the body:");
  console.log(req.body);
  runSample(req.body.utterance).then((r) => res.send({"answer": r}));

});

router.post('/webhook/', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log(Object.keys(req));
  res.send(JSON.stringify({
    "fulfillmentText": "I am J.A.R.V.I.S., your personal assistant. Nice to meet you! " +
      "Try asking about your favorite superheroes, comics, or creators!",

  }));
});

module.exports = router;
