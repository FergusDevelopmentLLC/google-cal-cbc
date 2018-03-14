const ical = require('ical');
const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

//HELPFUL LINK: https://michaelheap.com/working-with-the-google-calendar-api-in-node-js/

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

module.exports = {

  getUpcommingMeetups: async (req, res, next) => {
    var meetups = {};
    ical.fromURL('http://api.meetup.com/Ethereum-Boulder/upcoming.ical', {}, function (err, ebData) {
      meetups['Ethereum-Boulder'] = getNextEventFor(ebData);
      ical.fromURL('http://api.meetup.com/Boulder-Blockchain/upcoming.ical', {}, function (err, bbdata) {
        meetups['Boulder-Blockchain'] = getNextEventFor(bbdata);
        ical.fromURL('http://api.meetup.com/Colorado-Government-Blockchain-Professionals/upcoming.ical', {}, function (err, cbpdata) {
          meetups['Colorado-Government-Blockchain-Professionals'] = getNextEventFor(cbpdata);
          ical.fromURL('http://api.meetup.com/Hyperledger-Denver/upcoming.ical', {}, function (err, hdata) {
            meetups['Hyperledger-Denver'] = getNextEventFor(hdata);
            ical.fromURL('http://api.meetup.com/Women-in-BlockChain-MeetUp/upcoming.ical', {}, function (err, wibcdata) {
              meetups['Women-in-BlockChain-MeetUp'] = getNextEventFor(wibcdata);
              ical.fromURL('http://api.meetup.com/Bitcoin-and-Beer/upcoming.ical', {}, function (err, babdata) {
                meetups['Bitcoin-and-Beer'] = getNextEventFor(babdata);
                ical.fromURL('http://api.meetup.com/Colorado-Springs-Blockchain-Crypto-Entrepreneurs/upcoming.ical', {}, function (err, csbcedata) {
                  meetups['Colorado-Springs-Blockchain-Crypto-Entrepreneurs'] = getNextEventFor(csbcedata);
                  ical.fromURL('http://api.meetup.com/Denver-Crypto-Group/upcoming.ical', {}, function (err, dcgdata) {
                    meetups['Denver-Crypto-Group'] = getNextEventFor(dcgdata);
                    ical.fromURL('http://api.meetup.com/Colorado-Springs-Blockchain-Crypto-Entrepreneurs/upcoming.ical', {}, function (err, csbcedata) {
                      meetups['Colorado-Springs-Blockchain-Crypto-Entrepreneurs'] = getNextEventFor(csbcedata);
                      ical.fromURL('http://api.meetup.com/Ethereum-Denver/upcoming.ical', {}, function (err, ededata) {
                        meetups['Ethereum-Denver'] = getNextEventFor(ededata);
                        ical.fromURL('http://api.meetup.com/rmbchain/upcoming.ical', {}, function (err, rmbdata) {
                          meetups['rmbchain'] = getNextEventFor(rmbdata);
                          ical.fromURL('http://api.meetup.com/Denver-Blockchain-Maximalists/upcoming.ical', {}, function (err, dbmData) {
                            meetups['Denver-Blockchain-Maximalists'] = getNextEventFor(dbmData);
                            res.status(200).json(meetups);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },
  getCalendars: async (req, res, next) => {
    fs.readFile('./controllers/client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
      }
      authorize(JSON.parse(content), function (auth) {
        var calendar = google.calendar('v3');
        calendar.calendarList.list({ auth: auth }, function (err, resp) {
          var calendars = [];
          for (cal in resp.items) {
            if (resp.items[cal].summary.includes("Events - ")) {
              calendars.push(resp.items[cal]);
            }
          }
          res.status(200).json(calendars);
        });
      }
      );
    });
  }
};

function getNextEventFor(data) {
  var i = 0;
  for (var k in data) {
    if (data.hasOwnProperty(k)) {
      var ev = data[k]
      if (ev.type == 'VEVENT') {
        if (i < 1) { return ev; }
        i++;
      }
    }
  }
  return 'No upcoming meetups scheduled.';
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function getCalendars(auth) {
  console.log(google);

  var calendar = google.calendar('v3');
  calendar.calendarList.list({ auth: auth }, function (err, resp) {
    //console.log(resp.items.length);
    return resp;
    // for(cal in resp.items) {
    //   console.log(resp.items[cal].summary + " - " + resp.items[cal].id);
    // }
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  var calendar = google.calendar('v3');

  calendarId: 'primary',
    calendar.events.list({
      auth: auth,
      calendarId: '7fj90qn3gui2ldv39vgm69bl92k0552m@import.calendar.google.com',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, function (err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      var events = response.items;
      if (events.length == 0) {
        console.log('No upcoming events found.');
      } else {
        console.log('Upcoming 10 events:');
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          //console.log(event);
          var start = event.start.dateTime || event.start.date;
          console.log('%s - %s', start, event.summary);
        }
      }
    });
}