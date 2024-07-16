const express = require("express");
const router = express.Router();

const { create,list,update ,destroy} = require('../controller/admin/Category')
const { createParts , sparePartsList , deleteSpareParts, updateSpareParts} = require('../controller/admin/SpareParts')

const { Login, logout } = require('../controller/admin/Login');
const { Dashboard , states} = require("../controller/admin/Dashboard");


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
router.post('/states',states)


module.exports = router;
