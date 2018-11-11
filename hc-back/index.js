const express = require('express');
const fs = require('fs');

const Server = require('./src/Server.js');

const app = express();
const port = 8000;

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
  res.send( servers );
})

app.listen(port, () => console.log(`Listening on port ${port}`));
