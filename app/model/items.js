const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const items = sequelize.define('item', {
    item_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    item_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rate: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    quantity: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = items;