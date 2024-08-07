const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn");
const city = require("./city");
const aasra = require("./aasra");
const uom = sequelize.define('uom',{
    unit_of_measurement:{
        type:DataTypes.STRING,
        allowNull:false,
    }
})


// sequelize.sync({})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = uom;