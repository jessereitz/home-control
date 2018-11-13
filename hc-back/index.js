const fs = require('fs');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');
const Ping = require('ping');

// Server abstraction
const Server = require('./src/Server.js');

// Set port, initialize express
const port = 8000;
const app = express();

// Set up body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up sessions
app.use(session({ secret: '9LB0CTiwXxMUtu+eFRfmcw09vSg=' }));

// Load configuration information of servers.
const serverData = JSON.parse(fs.readFileSync('./server-config.json', 'utf-8'));
// Initialize server objects
const servers = serverData.servers.map(info => {
  const returnServer = Object.create(Server);
  returnServer.init(info);
  return returnServer;
});


/**
 * Home page - (Will) render the React app.
 *
 */
app.get('/', (req, res) => res.send('hello!'));


/*************************
 *                       *
 *          API          *
 *                       *
 ************************/

/* API - Endpoints for interacting with the servers. */

/**
 * User - Interact with the user.
 *
 */
app.get('/api/user', (req, res) => {
  res.send( { username: 'jesse', id: '1' } );
});

/**
 * Servers - Get information about the servers.
 *
 */
app.get('/api/servers', (req, res) => {
  res.send( servers );
});

/**
 * Ping - Ping the requested server.
 *
 * @param ip - The IP to ping.
 *
 */
app.get('/api/ping/:ip', (req, res) => {
  const { ip } = req.params;
  const server = servers.find((el) => el.ip === ip);
  server.ping((status) => {
    res.send(status);
  });
});
/**
 * Start - Sends a magic packet to the server.
 *
 */
app.get('/api/start/:mac', (req, res) => {
  const { mac } = req.params;
  const server = servers.find((el) => el.mac === mac);
  if (!server) {
    res.send({
      status: 'error',
      msg: 'No server found',
      online: false,
    });
    return;
  }
  server.start((status) => {
    res.send(status);
  });
});

/**
 * Shutdown - Sends a shutdown request to the server.
 *
 * @param ip The IP of the server to shut down.
 *
 */
app.post('/api/shutdown/:ip', (req, res) => {
  const { ip } = req.params;
  if (!ip || !req.body.username || !req.body.password) {
    return {
      status: 'error',
      msg: 'Incorrect authentication information.',
    };
  }
  const server = servers.find(el => el.ip === ip);
  server.shutdown(req.body.username, req.body.password, (status) => res.send(status));
});

/**
 * Restart - Send a restart request to the server.
 *
 * @param ip The ip of the server to restart.
 *
 */
app.post('/api/restart/:ip', (req, res) => {
  const { ip } = req.params;
  if (!ip || !req.body.username || !req.body.password) {
    return {
      status: 'error',
      msg: 'Incorrect authentication information.',
    };
  }
  const server = servers.find(el => el.ip === ip);
  server.restart((status) => res.send(status));
});


// Start the server.
app.listen(port, () => console.log(`Listening on port ${port}`));
