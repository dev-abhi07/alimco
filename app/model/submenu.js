const { DataTypes } = require("sequelize");
const sequelize = require("../connection/conn");


const subMenu = sequelize.define("sub_menu", {
  id:{
    type:DataTypes.INTEGER,
    allowNull:false,
    field:'id',
    primaryKey:true,
    autoIncrement:true
  },
  sub_menu: {
    type: DataTypes.STRING,
    allowNull: false,
    // validate: {
    //   customValidator(value) {
    //     if (!/^[a-z]+$/i.test(value)) {
    //       throw new Error('Name must only contain letters');
    //     }
    //   },
    // },
    // unique:true,
  },
  order: {
    type: DataTypes.INTEGER,
   
  },
  page_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  menu_id: {
    type: DataTypes.INTEGER,
   
  },
  sub_submenu_id:{
    type:DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.BOOLEAN,
   
  },
},
);

// sequelize.sync().then(()=>{
//   console.log("user table created");
// }).catch((error)=>{
//   console.log(error);
// })

module.exports = subMenu;
