import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import {ActiveConnections, IncomingCoordinates} from './types';
import * as crypto from 'crypto';

const app = express();
expressWs(app);
const port = 8000;
app.use(cors());

const router = express.Router();
const activeConnections: ActiveConnections = {};

router.ws('/canvas', (ws, req) => {
  const id = crypto.randomUUID();
  activeConnections[id] = ws;

  console.log('client connected id', id);
  ws.on('message', (msg) => {
      const decodedCoords = JSON.parse(msg.toString()) as IncomingCoordinates;

      if (decodedCoords.type === 'SEND_COORDS') {

        Object.keys(activeConnections).forEach((key) => {
          const conn = activeConnections[key];
          conn?.send(JSON.stringify({
            type: 'NEW_COORDS',
            payload: {
              x: decodedCoords.payload.x,
              y: decodedCoords.payload.y
            }
          }));
        });
      }

      if (decodedCoords.type === 'CLEAR') {

        Object.keys(activeConnections).forEach((key) => {

          const conn = activeConnections[key];
          conn?.send(JSON.stringify({
            type: 'CLEAR',
            payload: {
              x: decodedCoords.payload.x,
              y: decodedCoords.payload.y
            }
          }));
        });
      }
    }
  );

  ws.on('close', () => {
    console.log('Client disconnected id', id);
    delete activeConnections[id];
  });


});

app.use(router);
app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});


