const { DataTypes, Transaction } = require("sequelize");
const sequelize = require("../connection/conn");


const invoicecopy = sequelize.define('invoicecopy', {
    order_id:{
        type: DataTypes.BIGINT,
        allowNull:false
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    
})
// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = invoicecopy