const Helper = {};
const CryptoJS = require("crypto-js");

const Roles = require('../model/role');
const UserPermissions = require('../model/user_permission');
const Menus = require('../model/menu');
const sequelize = require("../connection/conn");

const users = require("../model/users");
const axios = require('axios');
const aasra = require("../model/aasra");




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

        UserPermissions.findAll({
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

        }).then(userpermissions => {
            return userpermissions
        }).catch(error => {
            console.error('Error fetching data:', error);
        });

    } catch (err) {
        console.log(err)
    }
};
Helper.getSubMenuPermission = async (id, userid) => {
    UserPermissions.findAll({
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

    }).then(userpermissions => {
        console.log("ssss", userpermissions)
        return userpermissions
    }).catch(error => {
        console.error('Error fetching data:', error);
    });

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
    // console.log(string)
    const user = await users.findOne({ where: { token: string[1] } });
    return user.id
}
Helper.getUserDetails = async (req) => {
    const token = req.headers['authorization'];
    const string = token.split(" ");
    // console.log(string)
    const user = await users.findOne({ where: { token: string[1] } });
    return user
}
Helper.getAasra = async (parameter) => {  
    aasraId = await aasra.findByPk(parameter)  
    unique_code = aasraId.unique_code
    id = unique_code.split('_')
    return id[1]
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
module.exports = Helper;