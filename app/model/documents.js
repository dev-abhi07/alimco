const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");

const document = sequelize.define("documents",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    aasra_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    photoImg:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'user_img'
    },
    panImg:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'pan_img'
    },
    adhaarImg:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'adhaar_img'
    },
    areaImgs:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'area_img'
    },
    marketImg:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'market_img'
    },
    salesImg:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'sales_img'
    },
    signatureImg:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'signature_img'
    },
    regImg:{
        type:DataTypes.STRING,
        allowNull:false,
        field:'reg_img'
    }

})
// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports= document