const express = require("express");
const { register,otpVerify, saveUser } = require("../controller/customer/register");

const customer = require("../middleware/customer");
const { arjunApi } = require("../controller/api/arjunApi");
const { Dashboard } = require("../controller/aasra/dashboard");
const { ticketListDetails } = require("../controller/aasra/ticket");
const router = express.Router();

router.post('/register',register)
router.post('/otp-verify',arjunApi,otpVerify)
router.post('/create-customer',saveUser)
router.post('/testapi',arjunApi)
router.post('/dashboard',Dashboard)
router.post('/ticketListDetails',ticketListDetails)
//Complaint

module.exports = router;
