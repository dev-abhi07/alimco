const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const labour_charges = sequelize.define('labour_charges', {
    slNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    codeNo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    natureOfWork: {
        type: DataTypes.STRING,
        allowNull: false
    },
    repairTime: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    labourCharges: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    finalLabourCharges: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});  

// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

 module.exports = labour_charges   