//server to serve requests

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const lyricsFinder = require("lyrics-finder");

//spotifywebapi library
const SpotifyWebApi = require("spotify-web-api-node");
const portNumber = 3001;

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;

  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  });
  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
        access_token: data.body.access_token,
        expires_in: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.sendStatus(400);
    });
});
app.post("/login", (req, res) => {
  const code = req.body.code;

  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) =>
      res.json({
        access_token: data.body.access_token,
        refresh_token: data.body.refresh_token,
        expires_in: data.body.expires_in,
      })
    )
    .catch((err) => {
      console.log(err.message);

      res.sendStatus(400);
    });
});

app.get("/lyrics", async (req, res) => {
  let lyrics =
    (await lyricsFinder(req.query.artist, req.query.title)) ||
    "No Lyrics Found";
  res.json({
    lyrics,
  });
});

app.listen(portNumber);
