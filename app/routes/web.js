const express = require("express");
const multer = require('multer');

const router = express.Router();

const { create,list,update ,destroy, uomCreate, listUom, updateUom, problemCreate, updateProblem, listProblem, manufacturerCreate, updateManufacturer, listManufacturer} = require('../controller/admin/category')
const { createParts , sparePartsList , deleteSpareParts, updateSpareParts , labourCharges} = require('../controller/admin/spareParts')
const { getUserList, userCreate, rolePermission, RoleList, getRolePermission, userPermission, getUserPermission, userStatusUpdate } = require("../controller/admin/user");
const { Login, logout, validateToken } = require('../controller/admin/login');
const {   states , cities , repair , revenueReport, paymentReport, partReplacementReport, inventoryWholeFormat,updateLabourCharges, createLabourCharges, destroyLabourCharges, generateNotes} = require("../controller/admin/dashboard");
const {Admin,menuListUserPermission, aasra} = require("../middleware/middleware");
const { registerAasraCentre, aasraList, updateAasraCenter, aasraType, aasraTypecreate, aasraTypelist, aasraTypeupdate, stocktransferupdate, importUser, uniqueOrderId, orderSucess, orderSucess1, orderSucess2, orderSucess3, importpartSerial, listpartSerialno, categoryRtoWiseProduct, rtuCategory, checkOpenPage, importStock, deleteAccount } = require("../controller/admin/aasra");
const { Dashboard , ticketList,getAasraRevenue, servicehistorylist, aasraGroupListCallCenter } = require("../controller/aasra/dashboard");
const { categoryWiseProduct, productRepairList , AarsaDropDown } = require("../controller/admin/aasra");
const { OtpVerifyAasra,createRepair , ticketOtpVerify , ticketSendOtp ,aasraChatList ,aasraMessage,openTicket,sentOtpWeb,getUser , getRegisteredData, createCustomerTicketAasraAndSaveUser,ticketDetails, createRtoSell, rtoList, createCustomerTicketAasraAndSaveUserCallCenter} = require("../controller/aasra/ticket");

const { arjunApi } = require("../controller/api/arjunApi");
const { route } = require("./customer");
const { otpVerify } = require("../controller/customer/register");
const {paymentApi} =require("../controller/api/payment") ;
router.post('/login', Login);
router.post('/logout', logout)

const upload = multer({ dest: 'uploads/' }); 
//Category Master

router.post('/create-category',Admin,create)
router.post('/category-list',Admin,list)
router.post('/update-category',Admin,update)
router.post('/delete-category',destroy)

//Spare Parts
router.post('/create-spare-part',Admin,createParts)
router.post('/spare-part-list',sparePartsList)
router.post('/delete-spare-part',Admin,deleteSpareParts)
router.post('/update-spare-part',Admin,updateSpareParts)

//State and City
router.post('/state-list',states)
router.post('/district-list',cities)


//Roles and Permission
router.post('/user-list',Admin,getUserList)
router.post('/create-user',Admin,userCreate)
router.post('/create-role-permission',Admin,rolePermission)
router.post('/role-list',Admin,RoleList)
router.post('/get-role-permission',getRolePermission)
router.post('/create-user-permission',userPermission)
router.post('/get-user-permission',getUserPermission)
router.post('/ticket-list',Admin,ticketList)
router.post('/category-product-list',Admin,categoryWiseProduct)
router.post('/product-repair-list',Admin,productRepairList)
router.post('/dashboard',Admin,menuListUserPermission,Dashboard)
router.post('/service-history-list',Admin,servicehistorylist)

//Aasra Centre
router.post('/register-aasra',Admin,registerAasraCentre)
router.post('/aasra-list',Admin,aasraList)
router.post('/update-aasra',Admin,updateAasraCenter)
router.post('/repair',aasra,createRepair)


//Close Ticket
router.post('/generate-otp',aasra,ticketSendOtp)
router.post('/open-ticket',aasra,openTicket)
router.post('/close-ticket',aasra,ticketOtpVerify)
router.post('/verify-otp',aasra,OtpVerifyAasra)

router.post('/create-aasra-chat',aasra,aasraMessage)
router.post('/aasra-chat-list',aasra,aasraChatList)


router.post('/aasra-dd-list',Admin,AarsaDropDown)
router.post('/labour-charges',Admin,labourCharges)
router.post('/inventory-report',Admin,repair)
router.post('/validate-token',validateToken)
router.post('/revenue-report',revenueReport)
router.post('/sentOtpWeb',arjunApi,sentOtpWeb)
router.post('/get-user',arjunApi,aasra,getUser)
router.post('/getRegisteredData',aasra,getRegisteredData)
router.post('/getAasraRevenue',aasra,getAasraRevenue)
router.post('/create-customer-ticket',aasra,createCustomerTicketAasraAndSaveUser)
router.post('/payment-report',Admin,paymentReport)
router.post('/part-repalacement',Admin,partReplacementReport)
router.post('/create-uom',Admin,uomCreate)
router.post('/uom-list',Admin,listUom)
router.post('/update-uom',Admin,updateUom)
router.post('/inventory-Whole-Format',Admin,inventoryWholeFormat)
router.post('/create-problem' ,Admin , problemCreate)
router.post('/update-problem' ,Admin , updateProblem)
router.post('/problem-list' ,Admin , listProblem)

router.post('/create-manufacturer' ,Admin ,manufacturerCreate)
router.post('/update-manufacturer' ,Admin , updateManufacturer)
router.post('/manufacturer-list',Admin ,listManufacturer)
router.post('/ticket-detail',ticketDetails)
router.post('/aasra-type',Admin,aasraType)
router.post('/aasratype-create', Admin , aasraTypecreate)
router.post('/aasratype-list',Admin, aasraTypelist)
router.post('/aasratype-update',Admin,aasraTypeupdate)
router.post('/stock-transfer-update',Admin,stocktransferupdate)
router.post('/update-labour-charges',Admin,updateLabourCharges)
router.post('/create-labour-charges',Admin,createLabourCharges)
router.post('/delete-labour-charges',Admin,destroyLabourCharges)
router.post('/generate-service-note',Admin,generateNotes)
router.post('/user-status-update',Admin,userStatusUpdate)

//payment gateway
router.post('/generate-order-number', uniqueOrderId)

router.post('/razorpay/callback', orderSucess)
router.post('/razorpay/callback-1', orderSucess1)
router.post('/razorpay/callback-2', orderSucess2)
router.post('/razorpay/callback-3', orderSucess3)

router.get("/razorpay/callback", (req, res) => {
    return res.redirect("https://octopod.co.in/payment/success");
});

router.post('/file-upload-part-serial',Admin, upload.single('file'), importpartSerial)
router.post('/list-part-serial',listpartSerialno)
router.post('/category-rto-product-list',Admin,categoryRtoWiseProduct)
router.post('/create-rto-sale',Admin, createRtoSell)
router.post('/rto-list',Admin, rtoList)
router.post('/verify-order',Admin, checkOpenPage)
router.post('/aasraList-callCenter',aasraGroupListCallCenter)
router.post('/callCenter-ticketcreate',Admin,createCustomerTicketAasraAndSaveUserCallCenter)
router.post('/file-upload-stock', Admin,upload.single('file'), importStock)
router.post('/delete-account',deleteAccount)
module.exports = router;
