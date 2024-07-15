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
// states.belongsTo(city,{foreignKey:'state_id',as:'statesData'})

module.exports = city;