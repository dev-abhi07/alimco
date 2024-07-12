const Helper = require("../helper/helper");
const users = require("../model/users");
const jwt = require("jsonwebtoken");

const customer = async (req, res,next) => {

    const token = req.headers['authorization'];
    try {
        const string = token.split(" ");
        const user = await users.findOne({
            where: {
                token: string[1]
            }
      
        if(user){
            if(user.user_type == 'A'){

                try{
                    const tokens = jwt.verify(string[1], process.env.SECRET_KEY);
                    next()
                }catch(error){
                    Helper.response("Failed", "Your Token is Expired", {}, res, 200);
                }               
            }
          else {
            Helper.response("Failed", "Unauthorized Access", {}, res, 200);
        }
    } catch (error) {
        Helper.response("Failed", "Unauthorized Access", {}, res, 200);
    }
}

module.exports = customer;