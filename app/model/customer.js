const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const users = require("./users");
const ticket = require("./ticket");

const customer = sequelize.define('customer', {
    beneficiary_id:{
        type:DataTypes.STRING,
        allowNull:true
    },
    father_name:{
        type:DataTypes.STRING,
        allowNull:true
    },
    dob:{
        type:DataTypes.STRING,
        allowNull:true
    },
    gender:{
        type:DataTypes.STRING,
        allowNull:true
    },
    district:{
        type:DataTypes.STRING,
        allowNull:true
    },
    state:{
        type:DataTypes.STRING,
        allowNull:true
    },
    aadhaar:{
        type:DataTypes.STRING,
        allowNull:true
    },


}
);
// ticket.belongsTo(customer,{foreignKey:'customer_id',as:'customer'})
// sequelize.sync({force:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = customer;