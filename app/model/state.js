const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn");
const city = require("./city");
const aasra = require("./aasra");
const states = sequelize.define('state',{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    }
})
states.hasMany(city, { as: 'city', foreignKey: 'state_id' });

// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = states;