const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn");
const city = require("./city");
const aasra = require("./aasra");
const partSerialNo = sequelize.define('partSerialNo',{
    moterTriSerialNo:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    hubDriveMoter:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    batteryOne:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    batterytwo:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    charger:{
        type:DataTypes.STRING,
        allowNull:true,
    },
    controller:{
        type:DataTypes.STRING,
        allowNull:true,
    }
})


// sequelize.sync({})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = partSerialNo;