const express = require("express");
const router = express.Router();

const { create,list,update ,destroy} = require('../controller/admin/category')
const { createParts , sparePartsList , deleteSpareParts, updateSpareParts} = require('../controller/admin/spareParts')
const { getUserList, userCreate, rolePermission, RoleList, getRolePermission, userPermission, getUserPermission } = require("../controller/admin/user");
const { Login, logout } = require('../controller/admin/login');
const { Dashboard , states , cities} = require("../controller/admin/dashboard");
const {Admin,menuListUserPermission} = require("../middleware/middleware");
const { registerAasraCentre, aasraList, updateAasraCenter } = require("../controller/admin/aasra");


router.post('/login', Login);
router.post('/logout', logout)


//Category Master

router.post('/create-category',create)
router.post('/category-list',list)
router.post('/update-category',update)
router.post('/delete-category',destroy)

//Spare Parts
router.post('/create-spare-part',createParts)
router.post('/spare-part-list',sparePartsList)
router.post('/delete-spare-part',deleteSpareParts)
router.post('/update-spare-part',updateSpareParts)

//State and City
router.post('/state-list',states)
router.post('/district-list',cities)


//Roles and Permission
router.post('/user-list',getUserList)
router.post('/create-user',userCreate)
router.post('/create-role-permission',rolePermission)
router.post('/role-list',RoleList)
router.post('/get-role-permission',getRolePermission)
router.post('/create-user-permission',userPermission)
router.post('/get-user-permission',getUserPermission)
router.post('/dashboard',Admin,menuListUserPermission,Dashboard)

//Aasra Centre
router.post('/register-aasra',registerAasraCentre)
router.post('/aasra-list',aasraList)
router.post('/update-aasra',updateAasraCenter)

module.exports = router;
