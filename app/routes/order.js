const express = require("express");
const router = express.Router();
const { createOrder, orderList, updateOrder, productApi, orderDetails, addStock, stockList, generatePurchaseOrder, purchaseOrderStatus, transactionList, updateOrderDetails } = require("../controller/aasra/order");
const { customer, Admin } = require("../middleware/middleware");

router.post('/create-purchase-order',createOrder)
router.post('/order-list',orderList)
router.post('/update-order',updateOrder)
router.post('/product-list',productApi)
router.post('/order-details',orderDetails)
router.post('/add-stock',addStock)
router.post('/stock-list',stockList)
router.post('/purchase-order',Admin,generatePurchaseOrder)
router.post('/purchase-order-status',Admin, purchaseOrderStatus)
router.post('/transaction-list',transactionList)
router.post('/update-order-details',Admin,updateOrderDetails)
module.exports = router;