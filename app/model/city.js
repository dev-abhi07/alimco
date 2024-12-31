const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn");
const states = require("./state");
const city = sequelize.define('citie',{
    city:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    state_id:{
        type:DataTypes.INTEGER,
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

module.exports = city;