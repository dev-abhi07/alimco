const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn");

const manufacturer = sequelize.define('manufacturer',{
    manufacturer_name :{
        type:DataTypes.STRING,
        allowNull:false,
    },
    manufacturer_code:{
        type:DataTypes.STRING,
        allowNull:false
    }
})


// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = manufacturer;