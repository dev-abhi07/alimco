const { axios } = require("axios")
const Helper = require("../../helper/helper")

exports.sendSms = async (req, res, next, otp) => {
    const mobile = req.body.udid
    const otp = otp

    url = `https://gateway.leewaysoftech.com/authenticationkey-transection-api.php?username=alimcocrm&authkey=7f7bd10803d3d49d3d381b5d62ab77d5&mobile=${mobile}&message=${message}&senderid=ALIMCO&type=text&peid=1001465796180149699&contentid=<`
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: url,
        headers: {}
    };
    axios.request(config)
    .then((response) => {
        //console.log(response.data)
        res.data = response.data ? response.data : []
        next()
    })
    .catch((error) => {
        console.log(error)
        Helper.response("Failed", "Internal  Server Error", { error }, res, 200)
    });

}