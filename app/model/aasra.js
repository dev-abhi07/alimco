const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");
const users = require('../model/users');
const ticket = require("./ticket");
const document = require("./documents");
const city = require("./city");
const states = require("./state");
const aasra = sequelize.define('aasra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true
    },
    name_of_org: {
        type: DataTypes.STRING,
        allowNull: true,
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
    name:
    {
        type: DataTypes.STRING,
        allowNull: false,
        field:'name_spoc'
    },
    designation_spoc:{
        type: DataTypes.STRING,
        allowNull: true
    },
    mobile_no:{
        type: DataTypes.BIGINT,
        allowNull:false,
        field:'mobile_spoc'
    },
    telephone:{
        type: DataTypes.STRING,
        field:'landline'
    },
    email:{
        type: DataTypes.STRING,
        allowNull:false,
        
    },
    latitude:{
        type: DataTypes.STRING,
        allowNull:true
    },
    longitude:{
        type: DataTypes.STRING,
        allowNull:true
    },
    center_image:{
        type: DataTypes.STRING,
        allowNull:true
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
    },
    state:{
        type: DataTypes.STRING,
        allowNull:true
    },
    district:{
        type: DataTypes.STRING,
        allowNull:true
    },
    dd_number:{
        type: DataTypes.STRING,
        allowNull:true
    },
     dd_bank:{
        type: DataTypes.STRING,
        allowNull:true
    },
    amount:{
        type: DataTypes.STRING,
        allowNull:true
    },
    regCertificate_no:{
        type: DataTypes.STRING,
        allowNull:true
    },
    pan_no:{
        type: DataTypes.STRING,
        allowNull:true
    },
    aadhaar_no:{
        type: DataTypes.STRING,
        allowNull:true
    },
    area_sqt:{
        type: DataTypes.STRING,
        allowNull:true
    },
    bank_name	:{
        type: DataTypes.STRING,
        allowNull:true
    }, 
    bank_address:{
        type: DataTypes.STRING,
        allowNull:true
    },
    branch_name	:{
        type: DataTypes.STRING,
        allowNull:true
    },
    ifsc_code:{
        type: DataTypes.STRING,
        allowNull:true
    }, 
    market_survey_no:{
        type: DataTypes.STRING,
        allowNull:true
    },
    annual_sales_potential:{
        type: DataTypes.STRING,
        allowNull:true
    },
    relative_in_alimco:{
        type: DataTypes.STRING,
        allowNull:true
    },
    additionalInfo:{
        type: DataTypes.STRING,
        allowNull:true
    },
    agreement_of_rupee:{
        type: DataTypes.STRING,
        allowNull:true
    },
    invest_agree:{
        type: DataTypes.STRING,
        allowNull:true
    },
    place:{
        type: DataTypes.STRING,
        allowNull:true
    },
   
    

},{
    timestamps:false
});


users.belongsTo(aasra, { foreignKey: 'ref_id', as: 'aasra' });
aasra.hasMany(document,{foreignKey:'aasra_id',as:'document'})
aasra.belongsTo(city,{foreignKey:'district',as:'city'})
aasra.belongsTo(states,{foreignKey:'state',as:'stateData'})
// sequelize.sync()
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });

module.exports = aasra;