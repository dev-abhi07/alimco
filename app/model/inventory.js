const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const inventory = sequelize.define('inventory',{   
    aasra_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    spare_parts_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    
})