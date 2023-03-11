var express = require('express');
var router = express.Router();

const { db } = require('tsslib/db.mysql');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let updated_since = req.query.updated_since;
  console.log(`request for all stores`);
  let stores = await db.getStores(updated_since);
  //console.log(stores);
  console.log(`response with ${stores.length} stores`);
  res.json({ stores });
});

module.exports = router;
