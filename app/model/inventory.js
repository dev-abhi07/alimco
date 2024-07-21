const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const inventory = sequelize.define('inventory',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
