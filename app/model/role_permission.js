const { request, response } = require("express");
const sequelize = require("../connection/conn");
const { DataTypes } = require("sequelize");
const Role = require("./role");
const Menu = require("./menu");

const role_permission = sequelize.define('rolepermission', {

    userId: {
        type: DataTypes.INTEGER,
        field: 'user_id'

    },
    roleId: {
        type: DataTypes.INTEGER,
        field: 'user_type'
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull:true,
    },
    menu_id: {
        type: DataTypes.INTEGER,
        type: DataTypes.INTEGER,


    },
    submenu_id: {
        type: DataTypes.INTEGER,

    },
    isView: {
        type: DataTypes.BOOLEAN,
        defaultValue: null
    },
    isCreate: {
        type: DataTypes.BOOLEAN,
        defaultValue: null
    },
    isUpdate: {
        type: DataTypes.BOOLEAN,
        defaultValue: null
    },
   
   


},
{
    timestamps:false
})
// sequelize.sync().then(()=>{
//   console.log("user_permission table created");
// }).catch((error)=>{
//   console.log(error);
// })
module.exports = role_permission;