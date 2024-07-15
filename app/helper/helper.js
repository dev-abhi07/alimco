const Helper = {};
const CryptoJS = require("crypto-js");
const users = require("../model/users");

Helper.response = (status, message, data = [], res, statusCode) => {
    res.status(statusCode).json({
        status: status,
        message: message,
        data: data,
    });
};

Helper.encryptPassword = (password) => {
    var pass = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();
    return pass;
};

Helper.decryptPassword = (password) => {
    var bytes = CryptoJS.AES.decrypt(password, process.env.SECRET_KEY);
    var originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    return originalPassword;
};
Helper.checkToken = async (token,next ,res ) => {
    const user = await users.findOne({
        where:{
            token:token
        }
    });  
    try{
        const tokens = jwt.verify(token, process.env.SECRET_KEY);
        next()
    }catch(error){
        
    }       
}

module.exports = Helper;