const { DataTypes, Transaction } = require("sequelize");
const sequelize = require("../connection/conn");
const aasra = require('../model/aasra')

const order = sequelize.define('order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    aasra_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_bill: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    total_tax: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    grand_total: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    gst: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    supplier_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shipping_charges: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    order_date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    payment_status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Pending'
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paid_amount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    due_amount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    payment_date: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dps_value: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 0
    },
    dps_date: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 0
    },
    dps_no: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 0
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    stock_transfer: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.STRING,
        allowNull: true,

    }
   
})
order.belongsTo(aasra, { foreignKey: 'aasra_id' })
// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = order