const axios = require('axios');
const Helper = require('../../helper/helper');

exports.arjunApi = (req, res, next) => {
  const UDID = req.body.udid


  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://adip.depwd.gov.in/api/CRM/GetBeneficiaryDetail?SearchType=searchUDID&Udid=${UDID}&UdidEnroll=0&Aadhaar=************`,
    headers: {}
  };

  axios.request(config)
    .then((response) => {
      res.data = response.data ? response.data : []
      next()
    })
    .catch((error) => {
      console.log(error)
      Helper.response("Failed", "Internal Server Error", { error }, res, 200)
    });


}