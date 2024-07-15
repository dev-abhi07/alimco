const express = require("express");
const router = express.Router();

const { create,list,update ,destroy} = require('../controller/admin/Category')
const { createParts , sparePartsList , deleteSpareParts} = require('../controller/admin/SpareParts')

const { Login, logout } = require('../controller/admin/Login');
const { Dashboard , states , cities} = require("../controller/admin/Dashboard");


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


//State and City
router.post('/state-list',states)
router.post('/district-list',cities)


module.exports = router;
