const express = require("express");
const router = express.Router();
const { productApi } = require("../controller/aasra/order");

router.post('/product-list',productApi)

module.exports = router
