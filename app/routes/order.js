const express = require("express");
const router = express.Router();
const { createOrder, orderList, updateOrderPayment, productApi, orderDetails, addStock, stockList,transactionList , generatePurchaseOrder ,purchaseOrderStatus ,updateOrderDetails, paymentStatus, orderTransfer, stockReports, bultiStockTransfer, nrmlStockTransfer, productRtuApi} = require("../controller/aasra/order");
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
router.post('/order-transfer-list',orderTransfer)
router.post('/stock-reports',stockReports)
router.post('/partial-stock-transfer',bultiStockTransfer)
router.post('/normal-stock-transfer',nrmlStockTransfer)
router.post('/produuct-rtu-list',productRtuApi)
module.exports = router;