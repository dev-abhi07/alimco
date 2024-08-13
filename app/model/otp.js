const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const otp = sequelize.define('otp', {   
    mobile:{
        type:DataTypes.STRING
    },
    otp: {
        type: DataTypes.BIGINT,
        allowNull: false       
    },
    status:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:1
    }
}
);

// sequelize.sync({force:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = otp;