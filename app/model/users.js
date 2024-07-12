const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
// const aasra = require('./aasra');  

const users = sequelize.define('user', {   
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    user_type: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    pass_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    token: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ref_id: {
        type: DataTypes.BIGINT,
    },
    udid:{
        type:DataTypes.STRING,
        allowNull:false
    }
});

 


module.exports = users;
