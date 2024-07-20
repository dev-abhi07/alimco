const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn")
const states = sequelize.define('state',{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    }
})
// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = states;