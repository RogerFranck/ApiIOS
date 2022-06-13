const app = require('./app');
require('./database');
require('dotenv').config();

async function master() {
  await app.listen(app.get('port'));
}

master();
