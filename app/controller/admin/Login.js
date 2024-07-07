const users = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");
const { resolveTxt } = require("dns");
const { where } = require("sequelize");


exports.Login = async (req, res) => {
    try {
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
                let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                    expiresIn: "6h",
                });
                await user.update(
                    { token: token },
                    { where: { email: req.body.email } }
                )
                Helper.response(
                    "Success",
                    "Login Successful",
                    {   
                        name: (user.name).match(/\b(\w)/g).join(''),
                        user: user,
                        base_url:process.env.BASE_URL
                    },
                    res,
                    200
                );
            } else {
                Helper.response(
                    "Failed",
                    "Check password",
                    {

                    },
                    res,
                    200
                );
            }
        } else {
            Helper.response(
                "Failed",
                "No user found",
                {

                },
                res,
                200
            );
        }
    } catch (error) {
        Helper.response(
            "Failed",
            "Internal server Error",
            { error },
            res,
            200
        );
    }
}
exports.logout = async (req, res) => {
    try {
        const token = req.headers["authorization"];
        const string = token.split(" ");
        const tokenUpdate = await users.update(

            { token: "" },

            { where: { token: string[1] } }
        );
        Helper.response("Success", "Logout Successfuly", {}, res, 200);
    } catch (error) {
        console.log(error);
        Helper.response("Failed", "Unable to Logout ", error, res, 200);
    }
};