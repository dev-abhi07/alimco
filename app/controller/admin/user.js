const UserModel = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");
const Role = require("../../model/role");
const { use } = require("../../routes/customer");
const Menu = require("../../model/menu");
const subMenu = require("../../model/submenu");
const role_permission = require("../../model/role_permission");
const user_permission = require("../../model/user_permission");




exports.getUserList = async (req, res) => {

  try {
    const users = await UserModel.findAll({
      order: [["id", "DESC"]],
    });

    var data = [];
    function getData() {
      return Promise.all(
        users.map(async (user) => {

          var role = await Role.findOne({ where: { user_type: user.user_type } });

          // console.log(district.rows[0])
          return {
            role: role?.user_type,
            id: user.id,
            name: user.name,
            password: user?.pass_code,
            mobile: user?.mobile,
            user_type: role?.id,
            email: user?.email,
            password: user?.pass_code,
            status: user?.status,
            unique_code:user?.unique_code
          };
        })
      );
    }
    getData().then((values) => {

      values.forEach((e) => {

        data.push({
          name: e.name ? e.name : "",
          userTypeName: e.role ? e.role : "",
          mobile: e?.mobile ? e?.mobile : "--",
          id: e?.id,
          user_type_id: e.user_type,
          password: e.password ? e.password : "-",
          status: e.status,
          email: e.email,
          unique_code:e.unique_code
        });
      });

      Helper.response("success", "Record Found Successfully", data, res, 200);
    });
  } catch (error) {
    console.log(error)
    Helper.response("failed", "No Record Found", { error }, res, 200);
  }
};

exports.userCreate = async (req, res) => {
  try {
    const { email, user_type, name, mobile, status, password } = req.body

    if (!email || !user_type || !name || !mobile || !status || !password) {
      return Helper.response("failed", "All fields are required", {}, res, 200);
    }
    if (user_type != 'S' && user_type != 'A') {
      return Helper.response("failed", "Enter correct user type", {}, res, 200);
    }

    const userEmail = await UserModel.findOne({ where: { email: email } });

    if (userEmail) {
      Helper.response(
        "failed",
        "Email Already Exist!",
        {},
        res,
        200
      );
      return;
    }
    const userPhone = await UserModel.findOne({ where: { mobile: mobile } });

    if (userPhone) {
      Helper.response(
        "failed",
        "Mobile Already Exist!",
        {},
        res,
        200
      );
      return;
    }


    const encryptPassword = await Helper.encryptPassword(password)

    const user = await UserModel.create({ email, user_type, name, mobile, status, pass_code: password, password: encryptPassword })
    const user_id = await UserModel.findOne({ where: { email: req.body.email } });
    const getRolePermission = await role_permission.findAll({
      where: { roleId: req.body.user_type },
    });
    getRolePermission.forEach(async (d) => {
      const data = {
        userid: user_id?.dataValues.id,
        submenu_id: d.dataValues?.submenu_id,
        menu_id: d.dataValues?.menu_id,
        roleId: d.dataValues?.roleId,
        isView: d.dataValues?.isView,
        isCreate: d.dataValues?.isCreate,
        isUpdate: d.dataValues?.isUpdate,
        isDelete: d.dataValues?.isDelete,
      };
      const permission = await user_permission.create(data);
      if (permission) {
        console.log("permission is given Successfully");
      }
    });
    Helper.response("success", "Record Created Successfully", user, res, 200);
  } catch (error) {
    console.log(error)
    Helper.response("failed", "Unable to create User", error, res, 200)
  }
}

exports.getUserPermission = async (req, res) => {
  try {
    const isView = false;
    const isCreate = false;
    const isUpdate = false;
    const User = req.body.user_id;
    if (!User) {
      return Helper.response("failed", "User Id is required", {}, res, 200);
    }
    const data = await user_permission.findAll({
      where: { userid: User },
    });

    const menu = await Menu.findAll();
    const totaldata = [];

    for (const e of menu) {
      const sub_menu_Data = await subMenu.findAll({
        where: { menu_id: e.dataValues.id },
      });

      if (sub_menu_Data.length > 0) {
        sub_menu_Data.forEach((f) => {
          const subMenuObject = {
            menu_id: e.dataValues.id,
            menu_name: e.dataValues.menu_name,
            sub_menu: f.dataValues.sub_menu,
            submenu_id: f.dataValues.id,
          };

          const permissionData = data.find((d) => d.menu_id === e.dataValues.id && d.submenu_id === f.dataValues.id);

          if (permissionData) {
            subMenuObject.isCreate = permissionData.isCreate || isCreate;
            subMenuObject.isView = permissionData.isView || isView;
            subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
          } else {
            subMenuObject.isCreate = isCreate;
            subMenuObject.isView = isView;
            subMenuObject.isUpdate = isUpdate;
          }

          totaldata.push(subMenuObject);
        });
      } else {
        const permissionData = data.find((d) => d.menu_id === e.dataValues.id);

        const subMenuObject = {
          menu_id: e.dataValues.id,
          menu_name: e.dataValues.menu_name,
          sub_menu: "",
          submenu_id: "",
          // isCreate: e.dataValues.isCreate || isCreate,
          // isView: e.dataValues.isView || isView,
          // isUpdate: e.dataValues.isUpdate || isUpdate,
        };

        if (permissionData) {
          subMenuObject.isCreate = permissionData.isCreate || isCreate;
          subMenuObject.isView = permissionData.isView || isView;
          subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
        } else {
          subMenuObject.isCreate = isCreate;
          subMenuObject.isView = isView;
          subMenuObject.isUpdate = isUpdate;
        }

        totaldata.push(subMenuObject);
      }
    }

    Helper.response("success", "Record Found Successfully", totaldata, res, 200);
  } catch (error) {
    console.log(error)
    Helper.response("failed", "Record Not Found", { error }, res, 200);
  }
};
exports.rolePermission = async (req, res) => {
  try {
    const reqData = req.body.permissions;

    const role_id = req.body.role_id;

    const roledata = await role_permission.destroy({
      where: { roleId: role_id },
    });
    if (roledata) {
      for (const element of reqData) {
        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            roleId: role_id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await role_permission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    } else {
      for (const element of reqData) {
        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            roleId: role_id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await role_permission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    }

    Helper.response("success", "Record Updated Successfully", {}, res, 200);
  } catch (err) {
    console.error("Error:", err);
    Helper.response("failed", "Internal Server Error", {}, res, 500);
  }
};
exports.RoleList = async (req, res) => {
  try {
    const role = await Role.findAll({ order: [["role", "ASC"]] });

    const data = [];
    role.map((element) => {
      const value = {
        id: element.dataValues.id,
        user_type: element.dataValues.user_type,
        value: element.dataValues.id,
        label: element.dataValues.role,
      }
      data.push(value)
    });

    Helper.response(
      "success",
      "Record Fetched Successfully",
      { data },
      res,
      200
    );

  } catch (error) {

    Helper.response("failed", "Record Not Found", { error }, res, 200);
  }
};

exports.getRolePermission = async (req, res) => {
  try {
    const isView = false;
    const isCreate = false;
    const isUpdate = false;
    const role = req.body.value;
    if (!role) {
      Helper.response("failed", "Role is required", {}, res, 200);
    }
    const data = await role_permission.findAll({
      where: { roleId: role },
    });

    const menu = await Menu.findAll();
    const totaldata = [];

    for (const e of menu) {
      const sub_menu_Data = await subMenu.findAll({
        where: { menu_id: e.dataValues.id },
      });

      if (sub_menu_Data.length > 0) {
        sub_menu_Data.forEach((f) => {
          const subMenuObject = {
            menu_id: e.dataValues.id,
            menu_name: e.dataValues.menu_name,
            sub_menu: f.dataValues.sub_menu,
            submenu_id: f.dataValues.id,
          };

          const permissionData = data.find((d) => d.menu_id === e.dataValues.id && d.submenu_id === f.dataValues.id);

          if (permissionData) {
            subMenuObject.isCreate = permissionData.isCreate || isCreate;
            subMenuObject.isView = permissionData.isView || isView;
            subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
          } else {
            subMenuObject.isCreate = isCreate;
            subMenuObject.isView = isView;
            subMenuObject.isUpdate = isUpdate;
          }

          totaldata.push(subMenuObject);
        });
      } else {
        const permissionData = data.find((d) => d.menu_id === e.dataValues.id);

        const subMenuObject = {
          menu_id: e.dataValues.id,
          menu_name: e.dataValues.menu_name,
          sub_menu: "",
          submenu_id: "",
          // isCreate: e.dataValues.isCreate || isCreate,
          // isView: e.dataValues.isView || isView,
          // isUpdate: e.dataValues.isUpdate || isUpdate,
        };

        if (permissionData) {
          subMenuObject.isCreate = permissionData.isCreate || isCreate;
          subMenuObject.isView = permissionData.isView || isView;
          subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
        } else {
          subMenuObject.isCreate = isCreate;
          subMenuObject.isView = isView;
          subMenuObject.isUpdate = isUpdate;
        }

        totaldata.push(subMenuObject);
      }
    }

    Helper.response("success", "Record Updated Successfully", totaldata, res, 200);
  } catch (error) {
    console.log(error)
    Helper.response("failed", "Record Not Found", { error }, res, 200);
  }
};
exports.userPermission = async (req, res) => {
  try {
    const reqData = req.body.permissions;

    // const token = req.headers["authorization"];
    // const string = token.split(" ");
    // const userToken = { token: string[1] };
    // console.log(userToken)
    // const user = await UserModel.getUser({ token: string[1] });
    const user_id = req.body.user_id;

    // const role_id = (await UserModel.findByPk(user_id)).dataValues.user_type;
    // console.log(role_id,'')
    const role_id = await UserModel.findOne({
      where: {
        id: user_id
      }
    })

    const roleId = await Role.findOne({
      where: {
        user_type: role_id.user_type
      }
    })
    const userdata = await user_permission.destroy({
      where: { userid: user_id },
    });

    if (userdata) {
      for (const element of reqData) {
        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            userid: req.body.user_id,
            userType: role_id.user_type,
            // role_id: roleId.id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await user_permission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    } else {
      for (const element of reqData) {

        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            userid: req.body.user_id,
            userType: role_id.user_type,
            // role_id: roleId.id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await user_permission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    }

    Helper.response("success", "Record Updated Successfully", {}, res, 200);
  } catch (err) {
    console.error("Error:", err);
    Helper.response("failed", "Internal Server Error", {}, res, 200);
  }
};


exports.userStatusUpdate = async (req, res) => {
  try {

    const userStatus = await UserModel.findOne({
      where: {
        id: req.body.id
      }
    })
    if (!userStatus) {
      return Helper.response(
        "failed",
        "user not found!",
        {},
        res,
        200
      );
    }
    if (userStatus.status === true) {
      const update = await UserModel.update({
        status: false

      }, {
        where: {
          id: req.body.id,
        }
      })
    } else {
      const update = await UserModel.update({
        status: true
      }, {
        where: {
          id: req.body.id,
        }
      })
    }

    Helper.response(
      "success",
      "status Update Successfully",
      {},
      res,
      200
    );
  } catch (error) {
    Helper.response(
      "failed",
      "Something went wrong!",
      { error },
      res,
      200
    );
  }
}