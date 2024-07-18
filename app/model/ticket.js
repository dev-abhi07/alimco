const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const aasra = require("../model/aasra");
const users = require("../model/users");

const ticket = sequelize.define('ticket', {
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
    itemName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    itemId:{
        type:DataTypes.STRING,
        allowNull:true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    appointment_date:
    {
        type: DataTypes.STRING,
        allowNull: true
    },
    appointment_time:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type: DataTypes.STRING,
        allowNull:true
    },  
});

// sequelize.sync()

//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = ticket;