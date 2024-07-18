const Helper = require("../helper/helper");
const UserModel = require("../model/users");
const jwt = require("jsonwebtoken");
const Menu = require("../model/menu");
const subMenu = require("../model/submenu");
const Admin = async (req, res, next) => {

  const token = req.headers['authorization'];
  try {
    const string = token.split(" ");
    const user = await UserModel.findOne({ where: { token: string[1] } });

    if (user?.user_type == 'S' || user?.user_type == 'A') {

      try {
        const tokens = jwt.verify(string[1], process.env.SECRET_KEY);
        next();
      } catch (error) {
        Helper.response("Expired", "Your Token is Expired", {}, res, 200);
      }

    } else {
      Helper.response("Expired   ", "Unauthorized Access", {}, res, 200);
    }
  } catch (error) {
    console.log(error)
    Helper.response("Failed", "Unauthorized Access", {}, res, 200);
  }
}
const customer = async (req, res, next) => {

  const token = req.headers['authorization'];
  try {
    const string = token.split(" ");
    const user = await UserModel.getUser({ token: string[1] });

    if (user.user_type == 'C') {

      try {
        const tokens = jwt.verify(string[1], process.env.SECRET_KEY);
        next();
      } catch (error) {
        Helper.response("Expired", "Your Token is Expired", {}, res, 200);
      }

    } else {
      Helper.response("Expired   ", "Token Expired due to another login,Login Again!!", {}, res, 200);
    }
  } catch (error) {
    Helper.response("Failed", "Unauthorized Access", {}, res, 200);
  }
}
const aasra = async (req, res, next) => {

  const token = req.headers['authorization'];
  try {
    const string = token.split(" ");
    const user = await UserModel.getUser({ token: string[1] });

    if (user.user_type == 'AC') {

      try {
        const tokens = jwt.verify(string[1], process.env.SECRET_KEY);
        next();
      } catch (error) {
        Helper.response("Expired", "Your Token is Expired", {}, res, 200);
      }

    } else {
      Helper.response("Expired   ", "Token Expired due to another login,Login Again!!", {}, res, 200);
    }
  } catch (error) {
    Helper.response("Failed", "Unauthorized Access", {}, res, 200);
  }
}
const menuListUserPermission = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    const string = token.split(" ");
    const user = await UserModel.findOne({ where: { token: string[1] } });
    console.log(user)
    var roleid = user.user_type;
    var userid = user.id;
    if (roleid == 'S') {

      const menuId = await Helper.getMenuByRole(roleid);

      const menu = await Menu.findAll({
        where: {
          status: true
        },
        order: [["order", "ASC"]]
      });


      var main_menu = [];
      async function fetchSubMenu(menuItem) {
        const subMenus = await subMenu.findAll({
          where: { menu_id: menuItem.dataValues.id, status: true },
          order: [["order", "ASC"]]
        });

        const subMenuArray = await Promise.all(
          subMenus.map(async (key) => {
            const submenu = await Helper.getSubMenuPermission(key?.dataValues?.id, userid);

            return {
              text: key.dataValues.sub_menu,
              link: key.dataValues.page_url,
              id: key.dataValues.id,
            };
          })
        );

        if (subMenuArray.length > 0) {
          return {
            id: menuItem.dataValues.id,
            icon: menuItem.dataValues.icon_class,
            text: menuItem.dataValues.menu_name,
            link: menuItem.dataValues.page_url,
            subMenu: subMenuArray.filter(Boolean),
          };
        } else {
          return {
            id: menuItem.dataValues.id,
            icon: menuItem.dataValues.icon_class,
            text: menuItem.dataValues.menu_name,
            link: menuItem.dataValues.page_url,
          };
        }
      }

      async function getMenuData() {
        for (const menuItem of menu) {
          const menuInfo = await fetchSubMenu(menuItem);
          main_menu.push(menuInfo);
        }
      }

      await getMenuData();

      res.filteredMenu = main_menu;
      next();
    } else {
      const menuId = await Helper.getMenuByRole(userid);
      // console.log(roleid);

      const menu = await Menu.findAll({ order: [["order", "ASC"]] });

      var main_menu = [];
      async function fetchSubMenu(menuItem) {
        const subMenus = await subMenu.findAll({
          where: { menu_id: menuItem.dataValues.id },
          order: [["order", "ASC"]]
        });

        const subMenuArray = await Promise.all(
          subMenus.map(async (key) => {
            const submenu = await Helper.getSubMenuPermission(key?.dataValues?.id, userid);

            if (submenu?.[0]?.isView == true) {
              return {
                text: key.dataValues.sub_menu,
                link: key.dataValues.page_url,
                id: key.dataValues.id,
              };
            }
          })
        );

        if (subMenuArray.length > 0) {
          return {
            id: menuItem.dataValues.id,
            icon: menuItem.dataValues.icon_class,
            text: menuItem.dataValues.menu_name,
            link: menuItem.dataValues.page_url,
            subMenu: subMenuArray.filter(Boolean),
          };
        } else {
          return {
            id: menuItem.dataValues.id,
            icon: menuItem.dataValues.icon_class,
            text: menuItem.dataValues.menu_name,
            link: menuItem.dataValues.page_url,
          };
        }
      }

      async function getMenuData() {
        for (const menuItem of menu) {
          const menuInfo = await fetchSubMenu(menuItem);
          main_menu.push(menuInfo);
        }
      }

      await getMenuData();
      var filteredMenu = main_menu.filter((f) => menuId?.some((d) => d.menu_id == f.id && d.isView == true));
      res.filteredMenu = filteredMenu ? filteredMenu : main_menu;

      next();
    }
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  Admin: Admin,
  customer: customer,
  aasra: aasra,
  menuListUserPermission: menuListUserPermission
}; 