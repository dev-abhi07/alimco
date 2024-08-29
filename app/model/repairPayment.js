const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const repairPayments = sequelize.define('repair_payments', {
    ticket_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    aasra_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    serviceCharge:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
        defaultValue:0.00
    },
    payment_mode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    receipt_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

// sequelize.sync()

//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = repairPayments;