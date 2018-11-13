const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Ping = require('ping');


const Server = require('./src/Server.js');

const port = 8000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serverData = JSON.parse(fs.readFileSync('./server-config.json', 'utf-8'));

const servers = serverData.servers.map(info => {
  const returnServer = Object.create(Server);
  returnServer.init(info);
  return returnServer;
});

app.get('/', (req, res) => res.send('hello!'));

app.get('/api/user', (req, res) => {
  console.log('incoming request');
  res.send( { username: 'jesse', id: '1' } );
});

app.get('/api/servers', (req, res) => {
  console.log('servers requested');
  // console.log(servers);
  res.send( servers );
});

app.get('/api/ping/:ip', (req, res) => {
  const { ip } = req.params;
  // console.log('ping requested');
  // console.log(ip);
  const server = servers.find((el) => el.ip === ip);
  server.ping((status) => {
    res.send(status);
  });
});

app.get('/api/start/:mac', (req, res) => {
  console.log('start requested');
  const { mac } = req.params;
  const server = servers.find((el) => el.mac === mac);
  console.log(mac);
  console.log(server);
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

async function shutdownServer(ip, username, password) {
  const { stdout, stderr } = await exec(`ssh -t ${username}@${ip} 'echo ${password} | sudo poweroff'`);
}

app.post('/api/shutdown/:ip', (req, res) => {
  const { ip } = req.params;
  if (!ip || !req.body.username || !req.body.password) {
    return {
      status: 'error',
      msg: 'Incorrect authentication information.',
    };
  }
  console.log('\n\nShutdown request:');
  const server = servers.find(el => el.ip === ip);
  server.shutdown(req.body.username, req.body.password, (status) => res.send(status));
});

app.post('/api/restart/:ip', (req, res) => {
  const { ip } = req.params;
  if (!ip || !req.body.username || !req.body.password) {
    return {
      status: 'error',
      msg: 'Incorrect authentication information.',
    };
  }
  console.log('\n\nRestart request.');
  const server = servers.find(el => el.ip === ip);
  server.restart((status) => res.send(status));
});

app.listen(port, () => console.log(`Listening on port ${port}`));
