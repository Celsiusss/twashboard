import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import * as queryString from 'querystring';
import axios from 'axios';

const app = express();

app.use(cors({ origin: true }));

app.post('/auth/token', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).send({ error: 'Missing field "code"' });
  }

  const tokenQuery = {
    client_id: functions.config().twitch.clientid,
    client_secret: functions.config().twitch.secret,
    redirect_uri: functions.config().twitch.redirecturi,
    grant_type: 'authorization_code',
    code
  };

  const url =
    'https://id.twitch.tv/oauth2/token?' + queryString.stringify(tokenQuery);
  try {
    const response = await axios.post(url);
    return res.status(200).send(response.data);
  } catch (error) {
    console.log(error.response.data);
    return res.status(500).send({ error: 'Some error happened' });
  }
});

app.post('auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).send({ error: 'Missing field "refresh_token"' });
  }

  const tokenQuery = {
    client_id: functions.config().twitch.clientid,
    client_secret: functions.config().twitch.secret,
    grant_type: 'refresh_token',
    refresh_token
  };

  const url =
    'https://id.twitch.tv/oauth2/token?' + queryString.stringify(tokenQuery);
  try {
    const response = await axios.post(url);
    return res.status(200).send(response.data);
  } catch (error) {
    console.log(error.response.data);
    return res.status(500).send({ error: 'Some error happened' });
  }
});

export const api = functions.https.onRequest(app);
