const express = require('express');
const router = express.Router();
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const axios = require('axios');

// let apiurl = "https://gateway.marvel.com:443/v1/public/characters/1009368?ts=1&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&hash=5fe138c49d763b8dd2f052d472324550";
function apiurl(charName) {
  const toReturn = `https://gateway.marvel.com/v1/public/characters?name=${encodeURIComponent(charName)}&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&ts=1&hash=5fe138c49d763b8dd2f052d472324550`;
  // console.log(toReturn);
  return toReturn
}
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

  console.log("sending text to df");
  // Send request and log result
  return sessionClient.detectIntent(request).then((responses) => {
    // console.log('Detected responses');
    // console.log(responses);
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

}

router.post('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log("This is the body:");
  console.log(req.body);
  runSample(req.body.utterance).then((r) => res.send({"answer": r})).catch((e) => console.log(e));

});

const REQ_CHARACTER = 'RequestCharacter';
const ASK_WHICH = 'AskWhich';

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}




router.post('/webhook/', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  // console.log(Object.keys(req));
  console.log("came through /webhook");
  // console.log(req.body);
  let intent = req.body.queryResult.intent.displayName;

  console.log("intent: ", intent);

  if (intent === REQ_CHARACTER) {
    axios.get(apiurl(req.body.queryResult.parameters.character)).then(response => {
      // console.log(response.data.data.results[0]);
      if (response.data.data.count === 0) {
        res.json({
          "fulfillmentText": "I couldn't find that character, please try again."

        })
      } else {
        // res.json({
        //   "fulfillmentText": response.data.data.results[0].description
        //
        // });
        // console.log(response.data.data.results[0].thumbnail.path + "." + response.data.data.results[0].thumbnail.extension);
        let toSay = response.data.data.results[0].description;
        if (!toSay) {
          toSay = `No description of ${req.body.queryResult.parameters.character} available in the database, please ` +
            `try someone else.`
        }
        return {
          "fulfillmentText": toSay,
          "payload": {
            "facebook": {
            },
            "kik": {

            },
            "line": {

            },
            "skype": {

            },
            "slack": {

              // "text": `https://a.slack-edge.com/4f28/img/slack_api_logo.png`,
              "attachments": [

                  {
                    "mrkdwn_in": ["text"],
                    "color": "#f0131e",
                    "pretext": `Here's the information I found on ${req.body.queryResult.parameters.character}:`,
                    // "author_name": "author_name",
                    // "author_link": "http://flickr.com/bobby/",
                    // "author_icon": "https://placeimg.com/16/16/people",
                    "title": response.data.data.results[0].name,
                    "title_link": response.data.data.results[0].urls[0].url,
                    "text": response.data.data.results[0].description,
                    "fields": [
                      {
                        "title": "Comic Appearances",
                        "value": response.data.data.results[0].comics.available,
                        "short": true
                      },
                      {
                        "title": "Story Appearances",
                        "value": response.data.data.results[0].stories.available,
                        "short": true
                      },
                      {
                        "title": "Event Appearances",
                        "value": response.data.data.results[0].events.available,
                        "short": true
                      }
                    ],
                    "thumb_url": response.data.data.results[0].thumbnail.path + "." + response.data.data.results[0].thumbnail.extension,
                    "footer": `Last updated: ${response.data.data.results[0].modified.slice(0,10)}`,
                    "footer_icon": "https://img.purch.com/o/aHR0cDovL3d3dy5uZXdzYXJhbWEuY29tL2ltYWdlcy9pLzAwMC8xODUvOTg1L2kwMi9NYXJ2ZWwtY29taWNzLWxvZ28tdmVjdG9yLmpwZw==",
                  }
                // {
                // "blocks":
                //   [
                //     {
                //       "type": "section",
                //       "text": {
                //         "type": "mrkdwn",
                //         "text": "_No logs matched_"
                //       }
                //     }
                //     ]
                // }




                //the really good one
              //   {
              //   "mrkdwn_in": ["blahblahb"],
              //   "color": "#36a64f",
              //   "pretext": "Optional pre-text that appears above the attachment block",
              //   "author_name": "author_name",
              //   "author_link": "http://flickr.com/bobby/",
              //   "author_icon": "https://placeimg.com/16/16/people",
              //   "title": "title",
              //   "title_link": "https://api.slack.com/",
              //   "text": "Optional `text` that appears within the attachment",
              //   "fields": [
              //     {
              //       "title": "A field's title",
              //       "value": "This field's value",
              //       "short": false
              //     },
              //     {
              //       "title": "A short field's title",
              //       "value": "A short field's value",
              //       "short": true
              //     },
              //     {
              //       "title": "A second short field's title",
              //       "value": "A second short field's value",
              //       "short": true
              //     }
              //   ],
              //   "thumb_url": "http://placekitten.com/g/200/200",
              //   "footer": "footer",
              //   "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
              //   "ts": 123456789
              // }
              ]



            },
            "telegram": {

            },
            "viber": {

            }
          }
        };
      }
    }).then((response) => {
      res.json(response);
    }).catch((e) => console.log(e));
    sleep(4500).then(() => {
      res.json( {"fulfillmentText": "slow response"});
      // Do something after the sleep!
    });

  } else if (intent === ASK_WHICH) {
    console.log("almost yuh");
    res.json({"fulfillmentText": "mmmmmmmmm"});
  } else {

      res.json({
        "fulfillmentText": "I am J.A.R.V.I.S., your personal assistant. Nice to meet you! " +
          "Try asking about your favorite superheroes, comics, or creators!",

      });
    }

  // console.log("got here")
});

module.exports = router;
