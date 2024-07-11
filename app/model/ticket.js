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
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,

    },

    aasra_id:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    product_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    destrpction: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    appointment_date:
    {
        type: DataTypes.STRING,
        allowNull: true
    },
    status:{
        type: DataTypes.STRING,
        allowNull:true
    },
    
    
},{
    timestamps: false,
});

// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = ticket;