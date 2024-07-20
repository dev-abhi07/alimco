const users = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");



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
                    expiresIn: "365d",
                });
                await user.update(
                    { token: token },
                    { where: { email: req.body.email } }
                )
                Helper.response(
                    "success",
                    "Login Successful",
                    {   
                        name: user.user_type == 'A' ? 'Admin':(user.name).match(/\b(\w)/g).join('')??'',
                        user: user,
                        base_url:process.env.BASE_URL
                    },
                    res,
                    200
                );
            } else {
                Helper.response(
                    "failed",
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
        console.log(error)
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
        Helper.response("success", "Logout Successfully", {}, res, 200);
    } catch (error) {
        // console.log(error);
        Helper.response("failed", "Unable to Logout ", error, res, 200);
    }
};