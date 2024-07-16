const Helper = {};
const CryptoJS = require("crypto-js");

const Roles = require('../model/role');
const UserPermissions = require('../model/user_permission');
const Menus = require('../model/menu');
const sequelize = require("../connection/conn");

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
            submenu_id:id
        },
       
    }).then(userpermissions => {
        console.log("ssss",userpermissions)
       return userpermissions
    }).catch(error => {
        console.error('Error fetching data:', error);
    });
    
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