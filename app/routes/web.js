const express = require("express");
const router = express.Router();

const { create,list,update ,destroy} = require('../controller/admin/category')
const { createParts , sparePartsList , deleteSpareParts, updateSpareParts , labourCharges} = require('../controller/admin/spareParts')
const { getUserList, userCreate, rolePermission, RoleList, getRolePermission, userPermission, getUserPermission } = require("../controller/admin/user");
const { Login, logout, validateToken } = require('../controller/admin/login');
const {   states , cities , repair , revenueReport, paymentReport} = require("../controller/admin/dashboard");
const {Admin,menuListUserPermission, aasra} = require("../middleware/middleware");
const { registerAasraCentre, aasraList, updateAasraCenter } = require("../controller/admin/aasra");
const { Dashboard , ticketList,getAasraRevenue } = require("../controller/aasra/dashboard");
const { categoryWiseProduct, productRepairList , AarsaDropDown } = require("../controller/admin/aasra");
const { createRepair , ticketOtpVerify , ticketSendOtp ,aasraChatList ,aasraMessage,openTicket,sentOtpWeb,getUser , getRegisteredData, createCustomerTicketAasraAndSaveUser} = require("../controller/aasra/ticket");
const { arjunApi } = require("../controller/api/arjunApi");


router.post('/login', Login);
router.post('/logout', logout)


//Category Master

router.post('/create-category',Admin,create)
router.post('/category-list',Admin,list)
router.post('/update-category',Admin,update)
router.post('/delete-category',destroy)

//Spare Parts
router.post('/create-spare-part',Admin,createParts)
router.post('/spare-part-list',Admin,sparePartsList)
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
router.post('/get-role-permission',Admin,getRolePermission)
router.post('/create-user-permission',Admin,userPermission)
router.post('/get-user-permission',Admin,getUserPermission)
router.post('/ticket-list',Admin,ticketList)
router.post('/category-product-list',aasra,Admin,categoryWiseProduct)
router.post('/product-repair-list',Admin,productRepairList)
router.post('/dashboard',Admin,menuListUserPermission,Dashboard)

//Aasra Centre
router.post('/register-aasra',Admin,registerAasraCentre)
router.post('/aasra-list',Admin,aasraList)
router.post('/update-aasra',Admin,updateAasraCenter)
router.post('/repair',aasra,createRepair)


//Close Ticket
router.post('/generate-otp',aasra,ticketSendOtp)
router.post('/open-ticket',aasra,openTicket)
router.post('/close-ticket',aasra,ticketOtpVerify)

router.post('/create-aasra-chat',aasra,aasraMessage)
router.post('/aasra-chat-list',aasra,aasraChatList)


router.post('/aasra-dd-list',Admin,AarsaDropDown)
router.post('/labour-charges',Admin,labourCharges)
router.post('/inventory-report',Admin,repair)
router.post('/validate-token',validateToken)
router.post('/revenue-report',Admin,aasra,revenueReport)
router.post('/sentOtpWeb',sentOtpWeb)
router.post('/get-user',arjunApi,aasra,getUser)
router.post('/getRegisteredData',aasra,getRegisteredData)
router.post('/getAasraRevenue',aasra,getAasraRevenue)
router.post('/create-customer-ticket',aasra,createCustomerTicketAasraAndSaveUser)
router.post('/payment-report',Admin,aasra,paymentReport)
module.exports = router;
