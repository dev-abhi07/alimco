
const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const order = require("./order");

const transaction = sequelize.define('transaction',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
    order_id:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    amount:{
        type: DataTypes.DOUBLE,
        allowNull:true,
    },
    order:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    time:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    receipt:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    status:{
        type: DataTypes.STRING,
        allowNull:true,
       
    },
    razorpay_payment_id:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    razorpay_signature:{
        type: DataTypes.STRING,
        allowNull:true,
    },
    description:{
        type: DataTypes.STRING,
        allowNull:true,
    },

})
// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = transaction;