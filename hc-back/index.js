#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const chalk = require('chalk');

// Server abstraction
const Server = require('./src/Server.js');
const User = require('./src/User.js');

// Set port, initialize express
const port = 8000;
const app = express();

// Set up body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieSession({
  name: 'session',
  keys: ['9LB0CTiwXxMUtu+eFRfmcw09vSg='],

  maxAge: 8 * 60 * 60 * 1000,
}));

app.use((req, res, next) => {
  if (req.session && req.session.user) return next();
  const apiHit = req.path.match(/api/);
  if (apiHit && req.path !== '/api/user/login') {
    res.send({
      status: 'error',
      msg: 'Please authenticate before continuing',
    });
  } else next();
  return null;
});

// Load configuration information of servers.
let serverData = null;
try {
  serverData = JSON.parse(fs.readFileSync('./server-config.json', 'utf-8'));
} catch (e) {
  console.error(chalk.bold.red('ERORR: No server data.'), "Please run 'npm run initialize' before starting the server.");
  process.exit(1);
}
// Initialize server objects
const servers = serverData.servers.map((info) => {
  const returnServer = Object.create(Server);
  returnServer.init(info);
  return returnServer;
});

app.use(express.static(path.join(__dirname, 'static')));


/**
 * Home page - (Will) render the React app.
 *
 */
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'static/build/index.html')));

/** **********************
 *                       *
 *          API          *
 *                       *
 ********************** */

/* API - Endpoints for interacting with the servers. */

/**
 * User - Interact with the user.
 *
 */
app.get('/api/user', (req, res) => {
  const returnObj = {};
    if (!req.session.user) {
    returnObj.status = 'error';
    returnObj.msg = 'No user.';
    res.send(returnObj);
  } else {
    User.init(req.session.user, (err, user) => {
      if (err) {
        returnObj.status = 'error';
        returnObj.msg = err.message;
      } else {
        returnObj.name = user.name;
        returnObj.username = user.username;
        returnObj.uid = user.id;
      }
      res.send(returnObj);
    });
  }
});

/**
 * Login - Allow the user to login.
 *
 * @returns {JSON} If successeful, returns with obj.status set to "success" and
 *  obj.user set to the user's info. Else obj.status = 'error' and obj.msg is the
 *  error message.
 *
 */
app.post('/api/user/login', (req, response) => {
  let returnObj = {};
  if (!req.body.username || !req.body.password) {
    returnObj = {
      status: 'error',
      msg: 'Invalid username or password',
    };
    return response.send(returnObj);
  }
  User.init(req.body.username, (err) => {
    if (err) {
      returnObj = {
        status: 'error',
        msg: err,
      };
      return response.send(returnObj);
    }
    User.checkPassword(req.body.password)
      .then((res) => {
        if (res) {
          returnObj = {
            status: 'success',
            msg: 'Successfully logged in.',
            user: {
              uid: User.info.id,
              name: User.info.name,
              username: User.info.username,
            },
          };
          req.session.user = User.info.id;
        } else {
          returnObj = {
            status: 'error',
            msg: 'Invalid password',
          };
        }
        return response.send(returnObj);
      })
      .catch((error) => {
        returnObj = {
          status: 'error',
          msg: error.message,
        };
        return response.send(returnObj);
      });
    return null;
  });
  return null;
});

app.get('/api/user/logout', (req, res) => {
  if (!req.session || !req.session.user) res.send({ status: 'error', msg: 'No user.' });
  else {
    req.session = null;
    res.send({ status: 'success', msg: 'Logged out successfully.' });
  }
});

/**
 * Servers - Get information about the servers.
 *
 */
app.get('/api/servers', (req, res) => {
  if (!req.session.user) return { status: 'error' };
  return res.send(servers);
});

/**
 * Ping - Ping the requested server.
 *
 * @param ip - The IP to ping.
 *
 */
app.get('/api/ping/:ip', (req, res) => {
  const { ip } = req.params;
  const server = servers.find(el => el.ip === ip);
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
  const server = servers.find(el => el.mac === mac);
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


/** **************************************
 *                                       *
 *     Authenticated Server Commands     *
 *                                       *
 ************************************** */

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
      msg: 'Please provide a username and password.',
    };
  }
  const server = servers.find(el => el.ip === ip);
  return server.shutdown(req.body.username, req.body.password, status => res.send(status));
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
  return server.restart(req.body.username, req.body.password, status => res.send(status));
});


// Start the server.
app.listen(port, () => console.log(`Listening on port ${port}`));
