const { request, response } = require("express");
const sequelize = require("../connection/conn");
const { DataTypes } = require("sequelize");
const Role = require("./role");
const Menu = require("./menu");



const user_permission = sequelize.define('userpermission',{
    userType :{
        type:DataTypes.INTEGER,
        allowNull:true,
        field:"user_type"

    },
    userid:{
        type:DataTypes.INTEGER,
        allowNull:false,
        field:'user_id'
    },
    submenu_id:{
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    menu_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
       
    },
    isView:{
        type:DataTypes.INTEGER,
        defaultValue:null

    },
    isCreate:{
        type:DataTypes.INTEGER,
        defaultValue:null
    },
    isUpdate:{
        type:DataTypes.INTEGER,
        defaultValue:null
    },
   


},{
    timestamps:false
})

user_permission.belongsTo(Role, { foreignKey: 'id' });
user_permission.belongsTo(Menu, { foreignKey: 'id' });

// sequelize.sync({force:true}).then(()=>{
//   console.log("role_permission table created");
// }).catch((error)=>{
//   console.log(error);
// })
 
module.exports = user_permission