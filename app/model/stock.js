const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const aasra = require("./aasra");



const stock = sequelize.define('stock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    aasra_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity:{
        type: DataTypes.INTEGER,
        allowNull:true
    },
    price:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    stock_in:{
        type: DataTypes.INTEGER,
        allowNull:true,
        defaultValue:0
    },
    stock_out:{
        type: DataTypes.INTEGER,
        allowNull:true,
        defaultValue:0
    }

})

// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports= stock