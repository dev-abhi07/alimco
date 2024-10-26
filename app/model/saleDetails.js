const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const saleDetail = sequelize.define('saleDetail', {
    sale_id:{
        type: DataTypes.BIGINT,
        allowNull:false
    },
    job_description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    categoryValue: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    categoryLabel: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    productValue: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    productLabel: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    productPrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    qty: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    newPart_sr_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    new_manufacturer_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    basePrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    unitPrice: {
        type: DataTypes.STRING,
        allowNull: true,
    },
})

// sequelize.sync()

//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = saleDetail;