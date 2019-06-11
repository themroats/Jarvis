const express = require('express');
const router = express.Router();

let i = 0;
/* GET home page. */
router.get('/', function(req, res, next) {
  i += 1;
  res.send("this is an APII route" + i);
});

module.exports = router;
