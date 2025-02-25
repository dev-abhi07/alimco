const { DataTypes } = require('sequelize');
const sequelize = require('../connection/conn');

const FirebaseToken = sequelize.define('FirebaseToken', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

// sequelize.sync({alter:true})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = FirebaseToken;