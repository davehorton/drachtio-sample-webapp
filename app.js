const express = require('express');
const app = express();
const config = require('config');
const router = require('./lib/router');

const server = app.listen(config.get('server'), () => {
  console.log(`call router app listening on ${JSON.stringify(server.address())} for http requests`);
});

app.get('/', router) ;
