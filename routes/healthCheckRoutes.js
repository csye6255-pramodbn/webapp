const express = require('express');
const router = express.Router();
const { connection } = require('../Database/postgres');
var helper = require('../utils/helper');

//ROUTES
router.get('/', async (req, res) => {
  const queryParams = Object.keys(req.query);
  const queryBody = Object.keys(req.body);

  const dbConnection = await connection();
  //Remove and Set response headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.removeHeader('Connection');
  res.removeHeader('Keep-Alive');

  // Check for the presence of the Authorization header
  if (req.headers.authorization) {
    res.status(400).json({
      message: 'Authorization header not required available for all users',
    });
  } else if (queryParams.length > 0 || queryBody.length > 0) {
    res.status(400).end();
  } else if (dbConnection) {
    res.status(200).end();
  } else if (!dbConnection) {
    res.status(503).end();
  }
});

router.get('/*', helper.invalidPath);
router.post('/', helper.methodNotAllowed);
router.put('/', helper.methodNotAllowed);
router.patch('/', helper.methodNotAllowed);
router.delete('/', helper.methodNotAllowed);
router.options('/', helper.methodNotAllowed);

module.exports = router;
