const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const aasra = require("../model/aasra");
const users = require("../model/users");

const grievance = sequelize.define('grievance', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    ticket_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,

    },
    aasraId:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    descriptionUser: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    descriptionAasra: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

// sequelize.sync({alter: true})

//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = grievance;