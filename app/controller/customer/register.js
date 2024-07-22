const users = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");
const otp = require("../../model/otp");
const customer = require("../../model/customer");
const items = require("../../model/items");
const { error } = require("console");


exports.register = async (req, res) => {
    try {
        const checkUdid = await users.count({
            where: {
                udid: req.body.udid
            }
        })
        if (checkUdid == 1) {
            const mobile = await users.findOne({
                where: {
                    udid: req.body.udid
                }
            })
            if (mobile.mobile != req.body.mobile) {
                Helper.response('failed', 'Please enter registered no.', {}, res, 200);
            } else {
                const mobile = validator.isMobilePhone(req.body.mobile, 'en-IN');
                const udid = validator.isAlphanumeric(req.body.udid, 'en-IN');
                if (mobile === true && udid === true) {
                    const data = otp.create({
                        mobile: req.body.mobile,
                        otp: 1234
                    })
                    Helper.response('success', 'OTP Sent Successfully', {}, res, 200);
                }
            }
        }
    } catch (error) {
        Helper.response('failed', 'Something went wrong!', {error}, res, 200);
    }
}

exports.otpVerify = async (req, res) => {


    try {

        const verify = otp.findOne({
            where: {
                mobile: req.body.mobile,
                status: 1
            }
        })

        const checkUser = await users.findOne({
            where: {
                mobile: req.body.mobile,
                udid: req.body.udid
            }
        });


        if (checkUser) {
            let token = jwt.sign({ id: checkUser.id }, process.env.SECRET_KEY, {
                expiresIn: "365d",
            });

            //console.log(token)
            await users.update({ token: token }, { where: { id: checkUser.id } }).catch((error) => {
                console.log(error)
            });
            Helper.response('success', 'Login Successfully', { user_data: { id: checkUser.id, name: checkUser.name, user_type: checkUser.user_type, token: token, udid: checkUser.udid } }, res, 200);
        }

        else {
            const beneficiaryId = res.data.res[0].beneficiaryName;
            const beneficiary = beneficiaryId.split("-");

            if (verify) {
                const update = await otp.update({
                    status: 0,
                },
                    {
                        where: {
                            mobile: req.body.mobile,
                            otp: req.body.otp,
                            status: 1
                        }
                    }
                )
                if (update) {
                    const userData = { beneficiary_id: beneficiary[1], name: beneficiary[0], father_name: res.data.res[0].fatherName, dob: res.data.res[0].dob, gender: res.data.res[0].gender, district: res.data.res[0].campVenueDistrict, state: res.data.res[0].campVenueState, aadhaar: res.data.res[0].aadhaar, udid: req.body.udid };
                    Helper.response('success', 'OTP Verified Successfully!', { mobile: req.body.mobile, userData: userData }, res, 200);
                }

            }
        }
    } catch (error) {
        console.log(error)
        Helper.response('failed', 'Something went wrong!', { error }, res, 200);
    }

}

exports.saveUser = async (req, res) => {

    try {
        if (req.body != '') {
            const user = await users.create({
                name: req.body.userData.name,
                mobile: req.body.mobile,
                user_type: 'C',
                udid: req.body.userData.udid,

            })
            if (user) {

                const createCustomer = await customer.create({
                    beneficiary_id: req.body.userData.beneficiary_id,
                    father_name: req.body.userData.father_name,
                    dob: req.body.userData.dob,
                    gender: req.body.userData.gender,
                    district: req.body.userData.district,
                    state: req.body.userData.state,
                    aadhaar: req.body.userData.aadhaar,
                    udid: req.body.userData.udid,
                })
                if (createCustomer) {
                    let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                        expiresIn: "365d",
                    });
                    await users.update({ token: token, ref_id: createCustomer.id }, { where: { id: user.id } });
                }
                userData = await users.findByPk(user.id)
                Helper.response('success', 'Register Successfully', { user_data: { id: userData.id, name: userData.name, user_type: userData.user_type, token: userData.token } }, res, 200);
            }

        }
    } catch (error) {
        console.log(error)
        Helper.response('failed', 'Something went wrong!', {}, res, 200);

    }
}
