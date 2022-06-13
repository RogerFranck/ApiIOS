const router = require('express').Router();
const DBMANAGER = require('../controller/mongodb');
const auth = require('../utils/checkauth');

router.get(`/api/:collection`, auth, async (req, res) => {
  const reqInfo = {
    collection: req.params.collection,
    query: req.query.query || ''
  };

  const response = await DBMANAGER.getAllMethod(reqInfo);
  res.json(response);
});

router.get(`/api/:collection/:id`, auth, async (req, res) => {
  const reqInfo = {
    collection: req.params.collection,
    id: req.params.id
  };

  const response = await DBMANAGER.getSingle(reqInfo);
  res.json(response);
});

router.post(`/api/:collection`, async (req, res) => {
  const reqInfo = {
    collection: req.params.collection,
    body: req.body
  };

  const response = await DBMANAGER.postAny(reqInfo);
  res.json(response);
});

router.post(`/api/:collection/validate`, async (req, res) => {
  const reqInfo = {
    collection: req.params.collection,
    body: req.body
  };

  const response = await DBMANAGER.login(reqInfo);
  res.json(response);
});

router.put(`/api/:collection/:id`, auth, async (req, res) => {
  const reqInfo = {
    collection: req.params.collection,
    body: req.body,
    id: req.params.id
  };

  const response = await DBMANAGER.updateMethod(reqInfo);
  res.json(response);
});

router.delete(`/api/:collection/:id`, auth, async (req, res) => {
  const reqInfo = {
    collection: req.params.collection,
    id: req.params.id
  };

  const response = await DBMANAGER.deleteMethod(reqInfo);
  res.json(response);
});


module.exports = router;
