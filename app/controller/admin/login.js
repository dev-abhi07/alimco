const users = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");



exports.Login = async (req, res) => {
    try {
        const a = CryptoJS.AES.decrypt(req.body.zero, process.env.SECRET_KEY);
        const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
     
        const requestData = {
            email: b.email,
            password: Helper.encryptPassword(b.password),
           
          };
       
        const user = await users.findOne({
            where: {
                unique_code: requestData.email,
            }
        });
    

        if (user == null) {
            Helper.response(
                "failed",
                "No user found",
                {

                },
                res,
                200
            );
        }
        
        if (user.status == 1) {
            if (Helper.decryptPassword(requestData.password) === Helper.decryptPassword(user.password)) {

                let token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
                    expiresIn: "2h",
                });
                await user.update(
                    { token: token },
                    { where: { email: requestData.email } }
                )
                const data = {
                      name: user.name,
                      user_type: user.user_type,
                      email: user.email,
                      mobile : user.mobile,
                      token : user.token,
                      udid : user.udid,
                      unique_code : user.unique_code
                }

                const response = {
                    name: user.user_type == 'A' ? 'Admin' : user.name.match(/\b(\w)/g).join(''),
                    user: data,
                    base_url: process.env.BASE_URL
                };
                const responseString = JSON.stringify(response);
                const encryptedResponse = Helper.encryptPassword(responseString);
                
                Helper.response(
                    "success",
                    "Login Successful",
                    encryptedResponse,
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
                "failed",
                "Account is inactive kindly contact to administrator",
                {

                },
                res,
                200
            );
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
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

exports.validateToken = async (req, res, next) => {
    const token = req.headers["authorization"];

    try {
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        if (user) {

            try {
                const tokens = jwt.verify(string[1], process.env.SECRET_KEY);
                var data = true;
                Helper.response("success", "Your Token is Valid", data, res, 200);
                next();
            } catch (error) {
                var data = false;
                Helper.response("expired", "Your Token is Expired", false, res, 200);
            }

        } else {
            Helper.response("expired", "Token Expired due to another login,Login Again!!", {}, res, 200);
        }
    } catch (error) {
        Helper.response("expired", "Unauthorized Access", {}, res, 200);
    }
};