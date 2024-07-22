const express = require("express");
const router = express.Router();

const { create,list,update ,destroy} = require('../controller/admin/category')
const { createParts , sparePartsList , deleteSpareParts, updateSpareParts} = require('../controller/admin/spareParts')
const { getUserList, userCreate, rolePermission, RoleList, getRolePermission, userPermission, getUserPermission } = require("../controller/admin/user");
const { Login, logout } = require('../controller/admin/login');
const {   states , cities} = require("../controller/admin/dashboard");
const {Admin,menuListUserPermission, aasra} = require("../middleware/middleware");
const { registerAasraCentre, aasraList, updateAasraCenter } = require("../controller/admin/aasra");
const { Dashboard , ticketList } = require("../controller/aasra/dashboard");
const { categoryWiseProduct, productRepairList } = require("../controller/admin/aasra");
const { createRepair , ticketOtpVerify , ticketSendOtp ,aasraChatList ,aasraMessage} = require("../controller/aasra/ticket");


router.post('/login', Login);
router.post('/logout', logout)


//Category Master

router.post('/create-category',create)
router.post('/category-list',list)
router.post('/update-category',update)
router.post('/delete-category',destroy)

//Spare Parts
router.post('/create-spare-part',createParts)
router.post('/spare-part-list',sparePartsList)
router.post('/delete-spare-part',deleteSpareParts)
router.post('/update-spare-part',updateSpareParts)

//State and City
router.post('/state-list',states)
router.post('/district-list',cities)


//Roles and Permission
router.post('/user-list',getUserList)
router.post('/create-user',userCreate)
router.post('/create-role-permission',rolePermission)
router.post('/role-list',RoleList)
router.post('/get-role-permission',getRolePermission)
router.post('/create-user-permission',userPermission)
router.post('/get-user-permission',getUserPermission)
router.post('/ticket-list',ticketList)
router.post('/category-product-list',aasra,categoryWiseProduct)
router.post('/product-repair-list',productRepairList)
router.post('/dashboard',Admin,menuListUserPermission,Dashboard)

//Aasra Centre
router.post('/register-aasra',registerAasraCentre)
router.post('/aasra-list',aasraList)
router.post('/update-aasra',updateAasraCenter)
router.post('/repair',createRepair)


//Close Ticket
router.post('/generate-otp',ticketSendOtp)
router.post('/close-ticket',ticketOtpVerify)

router.post('/create-aasra-chat',aasraMessage)
router.post('/aasra-chat-list',aasraChatList)



module.exports = router;
