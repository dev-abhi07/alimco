const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const sale = sequelize.define('sale', {
    
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    aasra_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    totalSpareCost: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gstAmount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gstPercent: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    grandTotal: {
        type: DataTypes.STRING,
        allowNull: true,
    },
})

// sequelize.sync()

    // .then(() => {
    //     console.log('Database & tables created!');
    // })
    // .catch(error => {
    //     console.error('Error creating database & tables:', error);
    // });

module.exports = sale;