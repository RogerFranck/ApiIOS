const mongo = require('mongodb');
const { ObjectId } = mongo;
const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
const { DBNAME, MONGODB_HOST, SECRET } = process.env;
const encryption = require('../utils/encyption');
const { allowedEvalKeyWords, disallowedEvalKeyWords } = require('../utils/constants')
const { each, isArray } = require('lodash');
const URI = `${MONGODB_HOST}${DBNAME}`;
const client = new MongoClient(URI, { useNewUrlParser: true });
exports.initialize = async () => {
  await client.connect();
}
exports.exportClient = () => {
  return client;
}
exports.getAllMethod = async (reqInfo) => {
  try {
    const {
      collection,
      query
    } = reqInfo;

    const response = await client.db(DBNAME).collection(collection).find(normalizeIfOid(JSON.parse(query))).toArray();

    return response;
  } catch (error) {
    return {
      errormessage: error.message
    };
  }
}

exports.getSingle = async (reqInfo) => {
  try {
    const {
      collection,
      id
    } = reqInfo;

    const response = await client.db(DBNAME).collection(collection).findOne({ _id: ObjectId(id) });

    return response;
  } catch (error) {
    return {
      errormessage: error.message
    };
  }
}

exports.postAny = async (reqInfo) => {
  try {
    const {
      collection,
      body
    } = reqInfo;
    if (body.username) {
      const exist = await client.db(DBNAME).collection(collection).findOne({ username: body.username });
      if (exist) {
        return {
          message: 'El usuario ya existe'
        };
      }
    }
    if (body.password) {
      body.password = await encryption.encryptPassword(body.password);
    }
    if (collection === 'carrito') {
      body.products = [];
    }
    const object = body.length ? body : [body];

    const insert = await client.db(DBNAME).collection(collection).insertMany(object);
    const response = Object.values(insert.insertedIds).map((id) => id);

    return { insertedIds: response };
  } catch (error) {
    return {
      errormessage: error.message
    };
  }
}

exports.login = async (reqInfo) => {
  try {
    const {
      collection,
      body
    } = reqInfo

    if (!body.password || !body.username) {
      return {
        message: 'Incomplete data provided.'
      };
    }
    const user = await client.db(DBNAME).collection(collection).findOne({ username: body.username });
    const validPassword = await encryption.matchPassword(
      body.password,
      user.password
    );
    if (!validPassword) {
      return {
        message: 'Incorrect data was provided'
      };
    }

    const accessToken = await jwt.sign({ id: user._id, type: 'user', email: user.email }, SECRET, { expiresIn: '100d' });

    return {
      user,
      accessToken
    };

  } catch (error) {
    console.log(error)
    return {
      errormessage: error.message
    }
  }
}

exports.updateMethod = async (reqInfo) => {
  try {
    const {
      collection,
      body,
      id
    } = reqInfo;

    if (body.password) {
      const passwordEncrypted = await encryptPassword(body.password || '');
      body.password = passwordEncrypted;
    }

    const response = await client.db(DBNAME).collection(collection).findOneAndUpdate({ _id: ObjectId(id) }, { $set: body });

    return response.value;
  } catch (error) {
    return {
      errormessage: error.message
    };
  }
}

exports.deleteMethod = async (reqInfo) => {
  try {
    const {
      collection,
      id
    } = reqInfo;

    const response = await client.db(DBNAME).collection(collection).findOneAndDelete({ _id: ObjectId(id) });

    return response.value;
  } catch (error) {
    return {
      errormessage: error.message
    };
  }
}

const normalizeIfOid = (query) => each(query, (val, key) => {
  try {
    if (key === '_id') {
      const hasValidKeyWords = allowedEvalKeyWords.every((keyWord) => JSON.stringify(val).includes(keyWord));
      console.log('hasValidKeyWords:', hasValidKeyWords)
      const hasInvalidKeyWords = disallowedEvalKeyWords.some((keyWord) => JSON.stringify(val).includes(keyWord));
      console.log('hasInvalidKeyWords:', hasInvalidKeyWords)

      if (!hasValidKeyWords || hasInvalidKeyWords) {
        query[key] = 'Invalid query';
        return;
      }

      if (query[key].$in && isArray(query[key].$in)) {
        query[key].$in = query[key].$in.map((query) => eval(query));
      } else if (query[key].$nin && isArray(query[key].$nin)) {
        query[key].$nin = query[key].$nin.map((query) => eval(query));
      } else {
        query[key] = eval(val);
      }
    }
  } catch { }
});
