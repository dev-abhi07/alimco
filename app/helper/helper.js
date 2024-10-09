const Helper = {};
const CryptoJS = require("crypto-js");

const Roles = require('../model/role');
const UserPermissions = require('../model/user_permission');
const Menus = require('../model/menu');
const sequelize = require("../connection/conn");
const axios = require('axios');
const aasra = require("../model/aasra");

const users = require("../model/users");
const ticket = require("../model/ticket");

const transaction = require("../model/transaction")


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

Helper.getMenuByRole = async (userid) => {
    try {


        const userId = userid

        const data = UserPermissions.findAll({
            attributes: [
                'menu_id',
                [sequelize.col('menu.menu_name'), 'menu_name'],
                'isView',
                'isCreate',
                'isUpdate'
            ],
            include: [
                {
                    model: Roles,
                    attributes: []
                },
                {
                    model: Menus,
                    attributes: []
                }
            ],
            where: {
                userid: userId
            },

        })
        return data
    } catch (err) {
        console.log(err)
    }
};
Helper.getSubMenuPermission = async (id, userid) => {
    try {
        const data = UserPermissions.findAll({
            attributes: [
                'menu_id',
                [sequelize.col('menu.menu_name'), 'menu_name'],
                'isView',
                'isCreate',
                'isUpdate'
            ],
            include: [
                {
                    model: Roles,
                    attributes: []
                },
                {
                    model: Menus,
                    attributes: []
                }
            ],
            where: {
                userid: userid,
                submenu_id: id
            },

        })
        return data
    } catch (error) {
        console.log(error)
    }



};

Helper.checkToken = async (token, next, res) => {
    const user = await users.findOne({
        where: {
            token: token
        }
    });
    try {
        const tokens = jwt.verify(token, process.env.SECRET_KEY);
        next()
    } catch (error) {

    }
}
Helper.generateNumber = async (min, max) => {
    total = Math.floor(Math.random() * (max - min) + min);
    return total;
};



Helper.createTimeSlots = async (openTime, closeTime, breakStartTime, breakEndTime, difference) => {


    const open = new Date(`1970-01-01T${openTime}:00`);
    const close = new Date(`1970-01-01T${closeTime}:00`);
    const breakStart = new Date(`1970-01-01T${breakStartTime}:00`);
    const breakEnd = new Date(`1970-01-01T${breakEndTime}:00`);
    const slots = [];
    const slotDuration = difference * 60 * 1000; // 45 minutes in milliseconds

    let currentTime = open;

    while (currentTime < close) {
        const endTime = new Date(currentTime.getTime() + slotDuration);
        if (endTime > close) break;

        if (currentTime < breakStart || currentTime >= breakEnd) {
            if (endTime <= breakStart || currentTime >= breakEnd) {
                slots.push({
                    start: currentTime.toTimeString().slice(0, 5),
                    end: endTime.toTimeString().slice(0, 5),
                });
            }
        }

        currentTime = endTime;
        if (currentTime >= breakStart && currentTime < breakEnd) {
            currentTime = breakEnd;
        }
    }

    return slots;


}

Helper.addYear = async (parameter) => {
    const date = new Date(parameter);
    const fullYear = date.getFullYear() + 1;
    const newDate = date.getDate() - 1
    const month = date.toLocaleString('default', { month: 'long' })
    const dates = newDate + '-' + month + '-' + fullYear;
    return dates
}

Helper.getUserId = async (req) => {
    const token = req.headers['authorization'];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });
    return user?.ref_id
}

Helper.getAasra = async (parameter) => {
    aasraId = await aasra.findByPk(parameter)
    unique_code = aasraId.unique_code
    // id = unique_code.split('_')
    // return id[1]
    return unique_code
}
Helper.pushNotification = async (token, notification) => {
    try {
        const headers = {
            "Authorization": "key=AAAA8hkiK-A:APA91bFYUWKt1Atinxrxf6rZJyUzdyZCHLVz1PsjilDronRJL9XmjC4RP-wlWavsFo38E-AFQ1aEq3RRg3SfNYvMck-IbX_kN7cAWez5pyWG4dJrpetq5GQojX-D54_79KjtLlJsYq_S", // Replace with your FCM server key
            "Content-Type": "application/json"
        };

        const data = {
            "to": token,
            "notification": notification
        };

        const response = await axios.post("https://fcm.googleapis.com/fcm/send", data, { headers });
        const result = response.data;
        console.log('Push notification sent successfully:', result);
        // return result;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw err
    }
};
Helper.getUserDetails = async (req) => {
    const token = req.headers['authorization'];
    const string = token.split(" ");
    // console.log(string)
    const user = await users.findOne({ where: { token: string[1] } });
    return user
}
Helper.getMonth = (date) => {
    const dates = new Date(date);
    const monthIndex = dates.getMonth();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const monthName = monthNames[monthIndex];
    return monthName;
}
Helper.formatDate = (date) => {

    // const year = date.getFullYear();

    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');
    // console.log(date)
    // const hours = String(date.getHours()).padStart(2, '0');
    // const minutes = String(date.getMinutes()).padStart(2, '0');
    // const seconds = String(date.getSeconds()).padStart(2, '0');
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
Helper.getAasraId = async (req) => {
    const token = req.headers['authorization'];
    const string = token.split(" ");
    const user = await users.findOne({ where: { token: string[1] } });

    return user?.ref_id
}


Helper.getFullYearForUnique = (data) => {
    const dateString = data;
    const date = new Date(dateString);

    // Get the year
    const year = date.getFullYear();

    return year;
}

Helper.compareDate = (dates) => {

    if (dates == undefined) {
        return false;
    } else {
        const dateParts = dates.split('-');
        const day = parseInt(dateParts[0], 10);
        const month = new Date(Date.parse(dateParts[1] + " 1, 2021")).getMonth();
        const year = parseInt(dateParts[2], 10);

        const dateToCompare = new Date(year, month, day);
        const currentDate = new Date();


        const dateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const cleanDateToCompare = dateOnly(dateToCompare);
        const cleanCurrentDate = dateOnly(currentDate);

        let warranty;

        if (cleanCurrentDate.getTime() <= cleanDateToCompare.getTime()) {
            warranty = true;

        } else {
            warranty = false;

        }


        return warranty;
    }

}

Helper.getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}

Helper.formatISODateTime = (isoString) => {
    if (!isoString) {
        return null;
    }
    const dateString = String(isoString);
    const date = new Date(dateString);
    // Format date
    const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Format time
    const formattedTime = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });


    return `${formattedDate} ${formattedTime}`;
}

Helper.maskAadhaar = (digit) => {

    return digit.replace(/\d{8}/, '********');
}

Helper.getAasraDetails = async (parameter) => {
    const aasra_name = await aasra.findOne({ where: { id: parameter } })

    return aasra_name;
}


Helper.createRazorpayOrder = async (amount, receipt_no) => {
    try {

        const rupees = amount;
        const amount_data = rupees * 100;


        console.log(amount_data, 'amount_data')

        const receipt_data = String(receipt_no);
        const razorpayKeyId = 'rzp_test_tgWgOfXw8Z4eKf';
        const razorpayKeySecret = 'AXI7G5GhhOOotCn5rTlitO7a';
        const url = `https://api.razorpay.com/v1/orders`;

        const data = {
            amount: amount_data,
            currency: "INR",
            receipt: receipt_data,
            payment_capture: 1
        };

        // Basic Authentication for Razorpay
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

        // Axios configuration
        const config = {
            method: 'post',
            url: url,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            data: data
        };

        // Making the API request
        const response = await axios.request(config);


        return { success: true, data: response.data };
    }
    catch (error) {

        return { success: false, error: error.response?.data || error.message };
    }
};

Helper.convertIso = (time) => {

    const timestampInMilliseconds = time * 1000;


    const date = new Date(timestampInMilliseconds);
    const timeiso = date.toISOString();
    return timeiso
}
Helper.istDateFormate = (time) => {
    const date = new Date(time);

    if (time == null) {
        return '';
    } else {
        // Extract the day, month, and year
        const formattedDate = date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0') + ' ';

        // Get hours and minutes, and determine AM/PM
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format

        // Construct the time with AM/PM
        const formattedTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

        // Return the formatted date and time
        return formattedDate + formattedTime;
    }
}


module.exports = Helper