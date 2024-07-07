const express = require("express");
const router = express.Router();

const { Login, logout } = require('../controller/admin/Login');


router.post('/login',Login);
router.post('/logout',logout)

module.exports = router;
