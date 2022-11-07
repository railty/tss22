var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const fs = require('fs');

const { config } = require('tsslib/config');

var indexRouter = require('./routes/index');
var employeesRouter = require('./routes/employees');
var punchesRouter = require('./routes/punches');

var app = express();

app.use(logger('dev'));
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ extended: false, limit: '250mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/employees', employeesRouter);
app.use('/punches', punchesRouter);

app.set('port', config.syncServer.port);

https.createServer({
  key: fs.readFileSync('./cert/local/out/sync-server.key'),
  cert: fs.readFileSync('./cert/local/out/sync-server.cert'),
//  passphrase: ''
}, app).listen(config.syncServer.port, () => console.log(`express https server started at port ${config.syncServer.port}`));
