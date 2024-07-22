const express = require("express");
const router = express.Router();
const { createOrder, orderList, updateOrder, productApi, orderDetails, addStock, stockList,transactionList } = require("../controller/aasra/order");

router.post('/create-purchase-order',createOrder)
router.post('/order-list',orderList)
router.post('/update-order',updateOrder)
router.post('/product-list',productApi)
router.post('/order-details',orderDetails)
router.post('/add-stock',addStock)
router.post('/stock-list',stockList)
router.post('/transaction-list',transactionList)
module.exports = router;