const express = require('express');

const app = express();
const port = 8000;

app.get('/', (req, res) => res.send('hello!'));

app.get('/api', (req, res) => {
  console.log('incoming request');
  res.send({ user: { username: 'jessereitz', id: '1' } });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
