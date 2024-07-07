const express = require("express");
const { register,otpVerify, saveUser } = require("../controller/customer/register");

const customer = require("../middleware/customer");
const { arjunApi } = require("../controller/api/arjunApi");
const router = express.Router();

router.post('/register',register)
router.post('/otp-verify',otpVerify)
router.post('/create-customer',saveUser)
router.post('/testapi',arjunApi)


//Complaint

module.exports = router;
