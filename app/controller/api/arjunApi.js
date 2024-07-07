const axios = require ('axios')
 
exports.arjunApi = ()=>{
let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://adip.depwd.gov.in/api/CRM/GetBeneficiaryDetail?SearchType=searchAadhaar&Udid=0&UdidEnroll=0&Aadhaar=************',
  headers: { }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

}