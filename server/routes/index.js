const express = require('express');
const router = express.Router();
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const axios = require('axios');
const util = require('util')


// let apiurl = "https://gateway.marvel.com:443/v1/public/characters/1009368?ts=1&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&hash=5fe138c49d763b8dd2f052d472324550";
function apiurl(charName, goal) {
  console.log("uhhh", goal);
  let toReturn = "";
  if (goal === 'character') {
    toReturn = `https://gateway.marvel.com/v1/public/characters?name=${encodeURIComponent(charName)}&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&ts=1&hash=5fe138c49d763b8dd2f052d472324550`;
  } else if (goal === 'comic') {
    toReturn = `https://gateway.marvel.com/v1/public/comics?titleStartsWith=${encodeURIComponent(charName)}&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&ts=1&hash=5fe138c49d763b8dd2f052d472324550`;
  } else if (goal === 'creator') {
    toReturn = `https://gateway.marvel.com/v1/public/creators?nameStartsWith=${encodeURIComponent(charName)}&apikey=4b3c2b558a833a5e655ad1fd6d22ecce&ts=1&hash=5fe138c49d763b8dd2f052d472324550`;
  }
  // console.log(toReturn);
  return toReturn
}
async function runSample(data) {
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
      parameters: {
        "character": data.character,
        "goal": data.goal
      },
      allRequiredParamsPresent: true,

      text: {
        // The query to send to the dialogflow agent

        text: data.utterance,
        // The language used by the client (en-US)
        languageCode: 'en',
      },
    },
  };
  console.log("request is: ", request.queryInput)

  // console.log("sending text to df");
  // Send request and log result
  return await sessionClient.detectIntent(request).then((responses) => {
    const result = responses[0].queryResult;
    // console.log('Detected responses');
    // // console.log(responses);
    // console.log(responses[0].queryResult.parameters)
    // // console.log(result);
    // console.log(`  Query: ${result.queryText}`);
    // console.log(`  Response: ${result.fulfillmentText}`);
    // if (result.intent) {
    //   console.log(`  Intent: ${result.intent.displayName}`);
    // } else {
    //   console.log(`  No intent matched.`);
    // }
    // console.log("result is", util.inspect(result.webhookPayload.fields.slack.structValue.fields.attachments.listValue.values[0].structValue.fields, {showHidden: false, depth: null}))

    return {
      "answer": result.fulfillmentText,
      "params": responses[0].queryResult.parameters.fields,
      "attachment": result.webhookPayload ? result.webhookPayload.fields.slack.structValue.fields.attachments.listValue.values[0].structValue.fields : {}
    }

  });

}

router.post('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log("This is the body:");
  console.log(req.body);
  runSample({"utterance": req.body.utterance, "allPresent": req.body.allPresent, "goal": req.body.goal, "character": req.body.character}).then((r) => res.send({"answer": r.answer, "params": r.params, "attachment": r.attachment})).catch((e) => console.log(e));

});

const REQ_CHARACTER = 'RequestCharacter';

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


function formatCreators(items) {
  let result = "";
  items.map((item) => {
    result += `${item.name} (${item.role}), \n`;
  });
  if (result.length !== 0) {
    result = result.substring(0, result.length - 3);
  }
  return result;
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
    let sent = false;
    if (req.body.queryResult.parameters.goal === "character") {
      axios.get(apiurl(req.body.queryResult.parameters.character, req.body.queryResult.parameters.goal)).then(response => {
        // console.log(response.data.data.results[0]);
        if (response.data.data.count === 0) {
          res.json({
            "fulfillmentText": "I couldn't find that character, please try again."

          });
          sent = true;
        } else {
          let toSay = response.data.data.results[0].description;
          if (!toSay) {
            toSay = `No description of ${req.body.queryResult.parameters.character} available in the database, please ` +
              `try someone else.`
          }

          return {
            "fulfillmentText": toSay,
            "payload": {
              "facebook": {},
              "kik": {},
              "line": {},
              "skype": {},
              "slack": {
                "attachments": [
                  {
                    "mrkdwn_in": ["text"],
                    "color": "#f0131e",
                    "pretext": `Here's the information I found on "${req.body.queryResult.parameters.character}":`,
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
                    "footer": `Last updated: ${response.data.data.results[0].modified.slice(0, 10)}`,
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
              "telegram": {},
              "viber": {}
            }
          };
        }
      }).then((response) => {
        if (!sent) {
          res.json(response);
        }
        sent = true;
      }).catch((e) => console.log(e));
    } else if (req.body.queryResult.parameters.goal === "comic") {
      axios.get(apiurl(req.body.queryResult.parameters.character, req.body.queryResult.parameters.goal)).then(response => {
        console.log(response.data.data.results[0]);
        if (!sent) {
          // res.json({"fulfillmentText": "comic response",});


          //stop
          res.json({
            "fulfillmentText": `${response.data.data.results[0].title} is a part of ${response.data.data.results[0].series.name}${response.data.data.results[0].events.available !== 0 ? " and " + response.data.data.results[0].events + " events" : ""} and was created by ${formatCreators(response.data.data.results[0].creators.items)}.`,
            "payload": {
              "facebook": {},
              "kik": {},
              "line": {},
              "skype": {},
              "slack": {
                "attachments": [
                  {
                    "mrkdwn_in": ["text"],
                    "color": "#f0131e",
                    "pretext": `Here's the information I found on "${req.body.queryResult.parameters.character}":`,
                    "title": response.data.data.results[0].title,
                    "title_link": response.data.data.results[0].urls[0].url,
                    "text": response.data.data.results[0].description,
                    "fields": [
                      {
                        "title": "Series:",
                        "value": response.data.data.results[0].series.name,
                        "short": false
                      },
                      {
                        "title": "Creators",
                        "value": formatCreators(response.data.data.results[0].creators.items),
                        "short": true
                      },
                      {
                        "title": "Events",
                        "value": response.data.data.results[0].events.available !== 0 ? response.data.data.results[0].events : "None",
                        "short": true
                      }
                    ],
                    "thumb_url": response.data.data.results[0].images.length !== 0 && response.data.data.results[0].thumbnail.path + "." + response.data.data.results[0].thumbnail.extension === "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg" ? "http://i.annihil.us/u/prod/marvel/i/mg/d/00/56f45f95cdd1e.jpg" : response.data.data.results[0].thumbnail.path + "." + response.data.data.results[0].thumbnail.extension,
                    "footer": `Last updated: ${response.data.data.results[0].modified.slice(0, 10)}`,
                    "footer_icon": "https://img.purch.com/o/aHR0cDovL3d3dy5uZXdzYXJhbWEuY29tL2ltYWdlcy9pLzAwMC8xODUvOTg1L2kwMi9NYXJ2ZWwtY29taWNzLWxvZ28tdmVjdG9yLmpwZw==",
                  }

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
              "telegram": {},
              "viber": {}
            }
          });
        }

        //stop
        sent = true;
      })


    } else if (req.body.queryResult.parameters.goal === "creator") {
      axios.get(apiurl(req.body.queryResult.parameters.character, req.body.queryResult.parameters.goal)).then(response => {
        console.log(response.data.data.results[0]);
        if (!sent) {


          //stop
          res.json({
            "fulfillmentText": `${response.data.data.results[0].fullName} has created ${response.data.data.results[0].comics.available} comics, ${response.data.data.results[0].stories.available} stories, ${response.data.data.results[0].events.available} events, and ${response.data.data.results[0].series.available} series.`,
            "payload": {
              "facebook": {},
              "kik": {},
              "line": {},
              "skype": {},
              "slack": {
                "attachments": [
                  {
                    "mrkdwn_in": ["text"],
                    "color": "#f0131e",
                    "pretext": `Here's the information I found on "${req.body.queryResult.parameters.character}":`,
                    "title": response.data.data.results[0].fullName,
                    "title_link": response.data.data.results[0].urls[0].url,
                    "text": response.data.data.results[0].description,
                    "fields": [
                      {
                        "title": "Comics Created",
                        "value": response.data.data.results[0].comics.available,
                        "short": true
                      },
                      {
                        "title": "Stories Created",
                        "value": response.data.data.results[0].stories.available,
                        "short": true
                      },
                      {
                        "title": "Events Created",
                        "value": response.data.data.results[0].events.available,
                        "short": true
                      },{
                        "title": "Series Created",
                        "value": response.data.data.results[0].series.available,
                        "short": true
                      }
                    ],
                    "thumb_url": response.data.data.results[0].thumbnail.path + "." + response.data.data.results[0].thumbnail.extension,
                    "footer": `Last updated: ${response.data.data.results[0].modified.slice(0, 10)}`,
                    "footer_icon": "https://img.purch.com/o/aHR0cDovL3d3dy5uZXdzYXJhbWEuY29tL2ltYWdlcy9pLzAwMC8xODUvOTg1L2kwMi9NYXJ2ZWwtY29taWNzLWxvZ28tdmVjdG9yLmpwZw==",
                  }

                ]

              },
              "telegram": {},
              "viber": {}
            }
          });
        }

        //stop
        sent = true;
      })
    } else {
      res.json({"fulfillmentText": "some other response, big confusion"});

    }
    sleep(4500).then(() => {
      if (!sent) {
        res.json({"fulfillmentText": "Things are taking too long, try asking the same thing again!"});
        sent = true;
      }
      //output the same intent or something
    });

  } else if (intent === ASK_WHICH) {
    res.json({"fulfillmentText": "you never should have come here"});
  } else {
      res.json({
        "fulfillmentText": "I am J.A.R.V.I.S., your personal assistant. Nice to meet you! " +
          "Try asking about your favorite superheroes, comics, or creators!",

      });
    }

});

module.exports = router;
