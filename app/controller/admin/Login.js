const users = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");


exports.Login = async (req, res) => {
    if (validator.isEmail(req.body.email) == false) {
        Helper.response(
            "Success",
            "Email is Invalid",
            {},
            res,
            200
        );
        return false
    }

    const user = await users.findOne({
        where: {
            email: req.body.email
        }
    });
    if (user) {
        if (req.body.password === Helper.decryptPassword(user.password)) {
            Helper.response(
                "success",
                "Login Successful",
                {
                    user: user
                },
                res,
                200
            );
        }
    }
    //console.log(user)    

}