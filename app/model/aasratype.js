const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn");

const aasraType = sequelize.define('aasraType',{
    type :{
        type:DataTypes.STRING,
        allowNull:false,
    },
    centre_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    state_id:{
        type:DataTypes.STRING,
        allowNull:false
    },
    city_id:{
        type:DataTypes.STRING,
        allowNull:false
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    contact_details:{
        type:DataTypes.STRING,
        allowNull:false
    },
    contact_person:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email_id:{
        type:DataTypes.STRING,
        allowNull:true
    }
})

// sequelize.sync({})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = aasraType;