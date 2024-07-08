const Helper = {};
const CryptoJS = require("crypto-js");

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
Helper.formatDateTime = (time) => {
    const dateObject = new Date(time);
  
    const day = dateObject.getDate();
    const month = dateObject.getMonth() + 1; 
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
  
  
    const formattedDay = day < 10 ? `0${day}` : day;
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  
    const formattedDate = `${formattedDay}-${formattedMonth}-${year} ${hours}:${formattedMinutes} ${ampm}`;
  
    return formattedDate;
  };

module.exports = Helper;