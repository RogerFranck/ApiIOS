const bodyParser = require('body-parser');
const express = require('express');
const DBMANAGER = require('./controller/mongodb');

DBMANAGER.initialize();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(require('./routes/api'));

module.exports = app;