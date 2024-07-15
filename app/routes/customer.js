const express = require("express");
const { register,otpVerify, saveUser } = require("../controller/customer/register");

const {Admin,menuListUserPermission} = require("../middleware/middleware");
const { arjunApi } = require("../controller/api/arjunApi");
const { Dashboard } = require("../controller/aasra/dashboard");
const { ticketListDetails } = require("../controller/aasra/ticket");
const { getUserList, userCreate, rolePermission, RoleList, getRolePermission, userPermission, getUserPermission } = require("../controller/admin/user");
const router = express.Router();

router.post('/register',register)
router.post('/otp-verify',arjunApi,otpVerify)
router.post('/create-customer',saveUser)
router.post('/testapi',arjunApi)

router.post('/dashboard',Admin,menuListUserPermission,Dashboard)
router.post('/ticketListDetails',ticketListDetails)
router.post('/user-list',getUserList)
router.post('/create-user',userCreate)
router.post('/create-role-permission',rolePermission)
router.post('/role-list',RoleList)
router.post('/get-role-permission',getRolePermission)
router.post('/create-user-permission',userPermission)
router.post('/get-user-permission',getUserPermission)
//Complaint

module.exports = router;
