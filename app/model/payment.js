const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const order = require("./order");

const payment = sequelize.define('payment',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
        },
    order_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    purchase_order:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },
    invoice:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
    },
    PO_number:{
        type: DataTypes.STRING,
        allowNull:true,
        defaultValue:0
    },
    invoice_number:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:0
    }

})
order.belongsTo(payment,{foreignKey:'id'})
// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = payment;