const express = require("express");
const router = express.Router();

const { Login } = require('../controller/admin/Login');

router.post('/login',Login);
module.exports = router;
