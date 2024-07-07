const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const aasra = require("./aasra");
const users = require("./users");

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
ticket.hasMany(users,{foreignKey:'customer_id',as:'tickets'})
ticket.hasMany(aasra,{foreignKey:'aasra_id',as:'aasra'})
// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = ticket;