const http = require('http');
const express = require('express');
const path = require('path');
const ws = require('ws');

const app = express();
const wss = new ws.Server({ port: 6060 });

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.use('/bootstrap-css', express.static(`${__dirname}/node_modules/bootstrap/dist/css`));
app.use('/bootstrap-js', express.static(`${__dirname}/node_modules/bootstrap/dist/js`));
app.use('/jquery', express.static(`${__dirname}/node_modules/jquery/dist`));

app.use('/css', express.static(`${__dirname}/public/css`));
app.use('/js', express.static(`${__dirname}/public/js`));

app.get('/', (_req, res) => {
    return res.render('index');
});

require('./websocket')(ws, wss);

const server = http.createServer(app);
server.listen(8000);