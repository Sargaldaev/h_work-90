import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import * as crypto from 'crypto';
import { ActiveConnections, IncomingMessage } from './types';

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());
app.use(express.json());

const router = express.Router();

const activeConnections: ActiveConnections = {};

const pixelsDb: string[] = [];

router.ws('/canvas', ws => {
  const id = crypto.randomUUID();
  activeConnections[id] = ws;

  ws.on('close', () => {
    delete activeConnections[id];
  });

  ws.send(JSON.stringify({
    type: 'SET_MESSAGES',
    payload: pixelsDb,
  }));

  ws.on('message', (msg) => {
    const { type, payload } = JSON.parse(msg.toString()) as IncomingMessage;

    switch (type) {
      case 'SEND_MESSAGE':
        pixelsDb.push(payload);
        Object.keys(activeConnections).forEach(connId => {
          const conn = activeConnections[connId];
          if (connId !== id) {
            conn.send(JSON.stringify({
              type: 'NEW_MESSAGE',
              payload,
            }));
          }
        });
        break;
    }
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server started on ${port} port`)
});