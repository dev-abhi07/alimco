const express = require("express");
const { register,otpVerify, saveUser } = require("../controller/customer/register");


const { arjunApi } = require("../controller/api/arjunApi");
const { Dashboard } = require("../controller/aasra/dashboard");
const { ticketListDetails } = require("../controller/aasra/ticket");
const { createCustomerTicket , ticketList,customerMessage,chatList}  = require('../controller/customer/ticket');
const { dashboard } = require("../controller/customer/dashboard");
const { customer } = require("../middleware/middleware");

const router = express.Router();

router.post('/register',register)
router.post('/otp-verify',arjunApi,otpVerify)
router.post('/create-customer',saveUser)
router.post('/testapi',arjunApi)



//

router.post('/ticketListDetails',ticketListDetails)
router.post('/create-ticket',createCustomerTicket)
router.post('/customer/dashboard',arjunApi,dashboard)
router.post('/customer/createTicket',createCustomerTicket)
router.post('/customer/ticket-list',ticketList)
router.post('/customer/message',customerMessage)
router.post('/customer/chat-list',chatList)


//Complaint

module.exports = router;
