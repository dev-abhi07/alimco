const express = require("express");
const { register, otpVerify, saveUser } = require("../controller/customer/register");


const { arjunApi } = require("../controller/api/arjunApi");
const { Dashboard } = require("../controller/aasra/dashboard");
const { ticketListDetails } = require("../controller/aasra/ticket");
const { getUserList, userCreate, rolePermission, RoleList, getRolePermission, userPermission, getUserPermission } = require("../controller/admin/user");
const { customer } = require("../middleware/middleware");
const { createCustomerTicket, ticketList, customerMessage, chatList, chatHistory } = require("../controller/customer/ticket");
const { saveToken } = require("../controller/customer/saveToken")



const router = express.Router();

router.post('/register', register)
router.post('/otp-verify', arjunApi, otpVerify)
router.post('/create-customer', saveUser)
router.post('/testapi', arjunApi)




router.post('/ticketListDetails', ticketListDetails)
router.post('/user-list', getUserList)
router.post('/create-user', userCreate)
router.post('/create-role-permission', rolePermission)
router.post('/role-list', RoleList)
router.post('/customer/createTicket', customer, createCustomerTicket)
router.post('/customer/ticket-list', customer, ticketList)


router.post('/customer/message', customer, customerMessage)
router.post('/customer/chat-list', customer, chatList)
router.post('/customer/save-token', customer, saveToken)
router.post('/customer/chat-history', customer, chatHistory)


/// dashboard///

router.post('/customer/chat-history', customer, chatHistory)
// router.post('/update-spare-part',updateSpareParts)
//Complaint

module.exports = router;
