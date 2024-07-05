const users = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");
const otp = require("../../model/otp");


exports.register = async (req, res) => {
    const mobile = validator.isMobilePhone(req.body.mobile, 'en-IN');
    if (mobile === true) {
        const data = otp.create({
            mobile: req.body.mobile,
            otp: 123456
        })
        Helper.response('success', 'OTP Sent Successfully', { otp_data: 123456 }, res, 200);
    }
}

exports.otpVerify = async (req, res) => {
    const verify = otp.findOne({
        where: {
            mobile: req.body.mobile,
            status: 1
        }
    })
    if (verify) {
        const update = otp.update({
            status: 0,
        },
            {
                where: {
                    mobile: req.body.mobile,
                    otp: 123456,
                    status: 1
                }
            }
        )
        if (update) {
            Helper.response('success', 'OTP Verified Successfully!', { mobile: req.body.mobile }, res, 200);
        }

    }
}

exports.saveUser = async (req, res) => {

    if (req.body.name != '' && req.body.mobile != '') {
        const user = await users.create({
            name: req.body.name,
            mobile: req.body.mobile,
            user_type: 'C'
        })       
        if (user) {
            let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                expiresIn: "365d",
            });
            await users.update({token:token},{where:{id:user.id}});
            userData = await users.findByPk(user.id)
            Helper.response('success', 'Register Successfully', { user_data: {id:userData.id,name:userData.name,user_type:userData.user_type,token:userData.token} }, res, 200);
        }
        
    } else {
        Helper.response('failed', 'Something went wrong!', {}, res, 200);
    }
}