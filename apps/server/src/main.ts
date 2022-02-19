/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */


import { readFileSync } from 'fs';
import app from './app/app'
import * as https from 'https'

import createSocketIo from './app/socketIos/socketIo'

const httpsOptions = {
  key: readFileSync(__dirname + '/assets/pem/server.key'),
  cert: readFileSync(__dirname + '/assets/pem/server.crt'),
}

const server = https.createServer(
  httpsOptions,
  app
)

const port = process.env.port || 3333;
server.listen(port, () => {
  console.log(`Listening at https://localhost:${port}`);
})

createSocketIo(server)

export default server
