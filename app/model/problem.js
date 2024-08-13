const { DataTypes } = require("sequelize")
const sequelize = require("../connection/conn");
const city = require("./city");
const aasra = require("./aasra");
const problem = sequelize.define('problem',{
    problem_name :{
        type:DataTypes.STRING,
        allowNull:false,
    }
})


// sequelize.sync({})
//     .then(() => {
//         console.log('Database & tables created!');
//     })
//     .catch(error => {
//         console.error('Error creating database & tables:', error);
//     });
module.exports = problem;