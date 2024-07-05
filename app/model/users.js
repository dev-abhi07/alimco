const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const users = sequelize.define('user', {   
    name:{
        type:DataTypes.STRING,
        allowNull:true
    },
    user_type:{
        type:DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull:true
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    pass_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    token:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    }

}
);

sequelize.sync({force:true})
    .then(() => {
        console.log('Database & tables created!');
    })
    .catch(error => {
        console.error('Error creating database & tables:', error);
    });

module.exports = users;