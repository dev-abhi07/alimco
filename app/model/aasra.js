const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const users = require('../model/users');
const ticket = require("./ticket");
const aasra = sequelize.define('aasra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name_of_org: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    website_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    unique_code: {
        type: DataTypes.STRING,
        allowNull: true
    },
    name_spoc:
    {
        type: DataTypes.STRING,
        allowNull: false
    },
    designation_spoc:{
        type: DataTypes.STRING,
        allowNull: false
    },
    mobile_spoc:{
        type: DataTypes.BIGINT,
        allowNull:false
    },
    landline:{
        type: DataTypes.STRING,
    },
    email:{
        type: DataTypes.STRING,
        allowNull:false
    },
    latitude:{
        type: DataTypes.STRING,
        allowNull:false
    },
    longitude:{
        type: DataTypes.STRING,
        allowNull:false
    },
    center_image:{
        type: DataTypes.STRING,
        allowNull:false
    },
    open_time:{
        type: DataTypes.STRING,
        allowNull:true
    },
    close_time:{
        type: DataTypes.STRING,
        allowNull:true
    },
    pincode:{
        type: DataTypes.STRING,
        allowNull:true
    }
},{
    timestamps:false
});


users.belongsTo(aasra, { foreignKey: 'ref_id', as: 'aasra' });
// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = aasra;