const express = require("express");
const router = express.Router();

const { create,list,update ,destroy} = require('../controller/admin/Category')
const { createParts } = require('../controller/admin/SpareParts')

const { Login, logout } = require('../controller/admin/Login');


router.post('/login', Login);
router.post('/logout', logout)


//Category Master

router.post('/create-category',create)
router.post('/category-list',list)
router.post('/update-category',update)
router.post('/delete-category',destroy)

//Spare Parts
router.post('/create-parts',createParts)
module.exports = router;
