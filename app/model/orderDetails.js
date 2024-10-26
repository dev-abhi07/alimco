const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const payment = require("./payment");
const order = require("./order");

const orderDetails = sequelize.define("orderDetail",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
    item_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_id:{
        type: DataTypes.BIGINT,
        allowNull:false
    },
    image:{
        type: DataTypes.TEXT,
        allowNull: true
    },
    unit_price:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,

    },
   


})
orderDetails.hasMany(payment,{foreignKey:'order_id'})
orderDetails.belongsTo(order,{foreignKey:'order_id'})
// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
 
module.exports = orderDetails