
const axios = require('axios');
const Helper = require('../../helper/helper');

exports.arjunApi = (req, res, next) => {
  const UDID = req.body.udid

  if (UDID.length == 12) {
    url = `https://adip.depwd.gov.in/api/CRM/GetBeneficiaryDetail?SearchType=searchAadhaar&Udid=0&UdidEnroll=0&Aadhaar=${UDID}`;
  } else {
    url = `https://adip.depwd.gov.in/api/CRM/GetBeneficiaryDetail?SearchType=searchUDID&Udid=${UDID}&UdidEnroll=0&Aadhaar=************`;
  }
    let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: url,

    headers: {}
  };

  axios.request(config)
    .then((response) => {
      console.log(response.data)
      res.data = response.data ? response.data : []
      next()
    })
    .catch((error) => {
      console.log(error)
      Helper.response("Failed", "Internal  Server Error", { error }, res, 200)
    });



}