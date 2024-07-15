const { request, response } = require("express");
const sequelize = require("../connection/conn");
const { DataTypes } = require("sequelize");

const Role = sequelize.define('role',{
    role:{
        type:DataTypes.STRING,
        allowNull: false,
    },
    user_type:{
        type:DataTypes.STRING,
    }
    // role_id:{
        
    //     type:DataTypes.INTEGER,
    //     allowNull:false
    // },
},{
    timestamps:false
});
// sequelize.sync().then(()=>{
//   console.log("Role table created");
// }).catch((error)=>{
//   console.log(error);
// })

module.exports=Role;