const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");


const Menu = sequelize.define("menu", {
  id:{
    type:DataTypes.INTEGER,
    field:'id',
    autoIncrement:true,
    primaryKey:true
  },
  menu_name: {
    type: DataTypes.STRING,
    allowNull: false,
    // validate:{   customValidator(value) {
    //   if (!/^[a-z]+$/i.test(value)) {
    //     throw new Error('Name must only contain letters');
    //   }
    // }, },
    // unique:true,
  },
  order: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.BOOLEAN,
   
  },
  icon_class:{
    type:DataTypes.STRING,
    allowNull:false,
    field:"icon"
  },
  page_url:{
    type:DataTypes.STRING,
    allowNull:true
  }
});

// Menu.hasMany(Menu,{as:'childrea',foreignKey:'parent_id'})
// sequelize.sync().then(()=>{
//   console.log("user table created");
// }).catch((error)=>{
//   console.log(error);
// })

module.exports = Menu;
