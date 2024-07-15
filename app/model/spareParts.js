const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const spareParts = sequelize.define('spare_part', {
    part_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
        allowNull: false
    },
    reorder_point: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    max_stock_level: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING
    }
})

// sequelize.sync({force:true})
// .then(() => {
//     console.log('Database & tables created!');
// })
// .catch(error => {
//     console.error('Error creating database & tables:', error);
// });

module.exports = spareParts;