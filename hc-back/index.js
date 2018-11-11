const express = require('express');
const fs = require('fs');

const Server = require('./src/Server.js');

const app = express();
const port = 8000;

const serverData = JSON.parse(fs.readFileSync('./server-config.json', 'utf-8'));

const servers = serverData.servers.map(info => {
  const returnServer = Object.create(Server);
  returnServer.init(info);
  console.log('initialized');
  // console.log(returnServer.ping());
  returnServer.ping(res => console.log(res));
  // setTimeout(() => console.log(returnServer), 2000);
  return returnServer;
});

app.get('/', (req, res) => res.send('hello!'));

app.get('/api/user', (req, res) => {
  console.log('incoming request');
  res.send( { username: 'jesse', id: '1' } );
});

app.get('/api/servers', (req, res) => {
  console.log('servers requested');
  console.log(servers);
  res.send( servers );
});

app.get('/api/ping/:ip', (req, res) => {
  const { ip } = req.params;
  console.log('ping requested');
  const server = servers.find((el) => el.ip === ip);
  console.log(server);
  console.log(ip);
  server.ping((status) => {
    res.send(status);
  });
});

app.get('/api/start/:mac', (req, res) => {
  console.log('start requested');
  const { mac } = req.params;
  const server = servers.find((el) => el.mac === mac);
  console.log(server);
  if (!server) {
    res.send({
      status: 'error',
      msg: 'No server found',
      online: false,
    });
    return;
  }
  console.log('starting...');
  server.start((status) => {
    console.log('\n\nfinal status');
    console.log(status);
    res.send(status);
  });

});

app.listen(port, () => console.log(`Listening on port ${port}`));
