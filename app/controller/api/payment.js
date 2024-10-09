const axios = require('axios');
const Helper = require('../../helper/helper');


const razorpayKeyId = 'rzp_test_tgWgOfXw8Z4eKf'; 
const razorpayKeySecret = 'AXI7G5GhhOOotCn5rTlitO7a';

exports.paymentApi = (req, res, next) => {
  const orderId = req.body;

  
  if (!orderId) {
    return Helper.response("Failed", "Order ID is required", {}, res, 400);
  }

 
  const url = `https://api.razorpay.com/v1/orders`;

  
  const data = {
    amount: orderId.amount, 
    currency: "INR",       
    receipt: orderId.receipt, 
    payment_capture: 1      
  };

  
  const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

 
  axios.request(config)
    .then((response) => {
      res.data = response.data ? response.data : [];
      next(); 
    })
    .catch((error) => {
      console.log(error);
      Helper.response("Failed", "Internal Server Error", { error: error.message }, res, 500);
    });
};
