import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import authRoutes from './auth';

// @ts-ignore
import * as serviceAccount from '../serviceAccountKey.json';

const app = express();

app.use(cors({ origin: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://twashboard-e51d4.firebaseio.com'
});

app.use('/auth', authRoutes);

export const api = functions.https.onRequest(app);
