import * as express from 'express';
import * as functions from 'firebase-functions';
import * as queryString from "querystring";
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as admin from 'firebase-admin';

const router = express.Router();

router.post('/token', async (req, res) => {
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

    console.log(response);
    const { id_token } = response.data;
    const decoded = jwt.decode(id_token);
    console.log(decoded);
    console.log(typeof decoded);

    if (typeof decoded === 'string' || !decoded) {
      return res.status(500).send('Expected response from Twitch to be JSON.');
    }
    const { email, sub } = decoded;

    if (!(email && sub)) {
      return res
        .status(400)
        .send('"email" and "sub" must be included in claims.');
    }

    const userSnapshot = await admin
      .firestore()
      .collection('users')
      .where('twitchId', '==', sub)
      .get();

    let userId;

    if (userSnapshot.empty) {
      const newUserRef = admin
        .firestore()
        .collection('users')
        .doc();
      userId = newUserRef.id;

      await newUserRef.set({
        email,
        twitchId: sub
      });
    } else {
      userId = userSnapshot.docs[0].id;
    }

    const customToken = await admin.auth().createCustomToken(userId);

    return res.status(200).send({
      twitch: { ...response.data, userId: sub },
      token: customToken
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ error: 'Some error happened' });
  }
});

router.post('/refresh', async (req, res) => {
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

export default router;
