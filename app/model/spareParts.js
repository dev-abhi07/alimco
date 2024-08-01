const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const category = require("./category");

const spareParts = sequelize.define('spare_part', {
    part_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    part_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.INTEGER
    },
    manufacturer: {
        type: DataTypes.STRING
    },
    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    quantity_in_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    reorder_point: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    max_stock_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    base_price:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0.00
    },
    serial_no:{
        type:DataTypes.STRING,
        allowNull:true
    },
    gst:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    },
    hsn_code:{
        type:DataTypes.STRING,
        allowNull:true
    },
    made_by:{
        type:DataTypes.STRING,
        allowNull:false
    },
    image: {
        type: DataTypes.STRING
    }
})
spareParts.belongsTo(category,{foreignKey:'category',as:'categories'})
// sequelize.sync()
// .then(() => {
//     console.log('Database & tables created!');
// })
// .catch(error => {
//     console.error('Error creating database & tables:', error);
// });

module.exports = spareParts;