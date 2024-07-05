const express = require("express");
const { register,otpVerify, saveUser } = require("../controller/customer/register");

const customer = require("../middleware/customer");
const router = express.Router();

router.post('/register',register)
router.post('/otp-verify',otpVerify)
router.post('/create-customer',saveUser)


//Complaint

module.exports = router;
