const mongoose = require('mongoose');

const { MONGODB_HOST, DBNAME } = process.env;

const URI = `${MONGODB_HOST}${DBNAME}`;

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const { connection } = mongoose;

connection.once('open', () => {
  console.log('Base de datos conectada');
});