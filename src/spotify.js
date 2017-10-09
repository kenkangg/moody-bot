
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const express = require('express');

var client_id = '12f16eadb026415dbdfb9cd544fa024e'; // Your client id
var client_secret = 'eb04415ad06249458d4a807432071bfe'; // Your secret
var redirect_uri = 'http://localhost:7000/callback'; // Your redirect uri



/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private playlist-read-private user-modify-playback-state playlist-read-collaborative';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
        refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };


  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});



/* Extend the file given from the Spotify Github to implement a check
for the mood and return the link and playlist name to match. */

//Reset Client info.
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId : '12f16eadb026415dbdfb9cd544fa024e',
  clientSecret : 'eb04415ad06249458d4a807432071bfe',
  redirectUri : 'http://localhost:8000/callback'
});

//Initialize mood variable to be passed into the checks.
function playlist(mood, callback) {


  spotifyApi.setAccessToken('BQAs9HQ85S7i9YZ6VZ790IdIeVybKxVQlFY1RChvyYSrlKb-fm7j9ko2Jwz1-xiHmVF8eZPK5EoMqdGKIhJv3raJJmx71RCqJmSv7zlvgQtjCXr7pdsfoEvImN3b6KiD160uV6-8TcBFNk6-JsQfuLJpiCBNWli6eV-w_AprDQFgfsuxDFAWGHE&refresh_token=AQA4rY2MnuBL6Al0lXkvdN_nqwQp4EdLsQdLDdu6_K0tGQK3HdWSX7B2rMohKNy-GFyz3hKGfN13L5kTwg_U4rWEkYfa2zv3vIbZhX4SAIIZ8MjeOZhLrlhuzR8zZTSjm9g');

  var angryMoods = ['angry', 'frustrated', 'mad', 'furious', 'enraged']
  var sadMoods = ['sad', 'depressed', 'sulky', 'dejected', 'unhappy', 'desolate', 'gloomy', 'miserable', 'heartbroken', 'pitiful', 'despondent', 'wretched', 'down', 'sorrow']
  var chillMoods = ['chill', 'meh', 'eh', 'cool', 'relax', 'relaxed']
  var nostalgicMoods = ['nostalgic', 'throwback', 'sentimental']
  //Check the current mood for THIS.
  if (mood =='sadness' || mood == "Sadness"){
    spotifyApi.getPlaylist('httpblue_', '7po73ySk4MLa832Lqmmyjf')
      .then(function(data) {
        callback("https://open.spotify.com/user/httpblue_/playlist/7po73ySk4MLa832Lqmmyjf");
        //console.log('Some information about this playlist:', data.body);
      }, function(err) {
        callback("Error");
        console.log('Something went wrong!', err);
    });
  } else if (mood == 'anger' || mood == 'Anger'){
    spotifyApi.getPlaylist('alltrapnation', '0NCspsyf0OS4BsPgGhkQXM')
      .then(function(data) {
        callback('https://open.spotify.com/user/alltrapnation/playlist/0NCspsyf0OS4BsPgGhkQXM')
        //console.log('Some information about this playlist:', data.body);
      }, function(err) {
        callback("Error");
        console.log('Something went wrong!', err);
    });
  } else if (mood == 'nostalgic' || mood == "neutral"){
    spotifyApi.getPlaylist('21u5jau43jjxvgkru4xc45xsa', '3O5xOfUTuIZSsLWXI653ML')
      .then(function(data) {
        callback('https://open.spotify.com/user/21u5jau43jjxvgkru4xc45xsa/playlist/3O5xOfUTuIZSsLWXI653ML')
        //console.log('Some information about this playlist:', data.body);
      }, function(err) {
        callback("Error");
        console.log('Something went wrong!', err);
    });
  } else if (mood == 'contempt' || mood == "fear" || mood == "chill") {
    spotifyApi.getPlaylist('icebergjwang', '0vncHZ9gT8Da0CBBxOUsE9')
      .then(function(data) {
        callback('https://open.spotify.com/user/icebergjwang/playlist/0vncHZ9gT8Da0CBBxOUsE9')
        //console.log('Some information about this playlist:', data.body);
      }, function(err) {
        callback("Error");
        console.log('Something went wrong!', err);
    });
  } else {
    spotifyApi.getPlaylist('centuriez14', '04MHZkrq7TJdjFNPjGjQ2Q')
      .then(function(data) {
        callback('https://open.spotify.com/user/centuriez14/playlist/04MHZkrq7TJdjFNPjGjQ2Q')
        //console.log('Some information about this playlist:', data.body);
      }, function(err) {
        callback("Error");
        console.log('Something went wrong!', err);
    });

  }
}

app.listen(8000);
console.log('Open: http://127.0.0.1:3500');

module.exports.playlist = playlist
