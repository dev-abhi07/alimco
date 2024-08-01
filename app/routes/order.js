const express = require("express");
const router = express.Router();
const { createOrder, orderList, updateOrderPayment, productApi, orderDetails, addStock, stockList,transactionList , generatePurchaseOrder ,purchaseOrderStatus ,updateOrderDetails, paymentStatus} = require("../controller/aasra/order");
const { Admin } = require("../middleware/middleware");

router.post('/create-purchase-order',createOrder)
router.post('/order-list',orderList)
router.post('/update-order',updateOrderPayment)
router.post('/product-list',productApi)
router.post('/order-details',orderDetails)
router.post('/add-stock',Admin,addStock)
router.post('/stock-list',stockList)
router.post('/transaction-list',transactionList)
router.post('/purchase-order',Admin,generatePurchaseOrder)
router.post('/purchase-order-status',Admin, purchaseOrderStatus)
router.post('/update-order-details',Admin,updateOrderDetails)
router.post('/payment-status',Admin,paymentStatus)
module.exports = router;