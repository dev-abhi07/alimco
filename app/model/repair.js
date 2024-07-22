const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const repair = sequelize.define('repair', {
    warranty: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    categoryValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    categoryLabel: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    productValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productLabel: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    repairValue: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    repairLabel: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    repairServiceCharge: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    repairTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    repairPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    repairGst: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    serviceCharge: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    ticket_id: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})

// sequelize.sync()

//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = repair;