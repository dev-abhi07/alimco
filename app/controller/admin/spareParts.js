const formidable = require("formidable");
const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const spareParts = require("../../model/spareParts");
const body = require('body-parser')
const fs = require('fs');
const category = require("../../model/category");
const { where } = require("sequelize");
const { kMaxLength } = require("buffer");

exports.createParts = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (!files.image ) {
                return Helper.response("failed", "Upload all images", null, res, 200);
            }
           
            const checkPartNumber = fields?.part_number?.[0]
            const ext = files?.image?.length>0?files?.image[0]?.mimetype:'image/jpeg'
            var oldpath = files?.image[0].filepath??''
            const newpath = 'public/' + files.image[0].originalFilename + '.' + ext.split('/')[1]
            fs.rename(oldpath, newpath, function (err) {
                if (err) {
                    Helper.response(
                        "failed",   
                        "",
                        { err },
                        res,
                        200
                    );
                } else {
                    const create = spareParts.create({
                        part_number: fields?.part_number[0],
                        part_name: fields?.part_name[0],
                        description: fields?.description[0],
                        category: fields?.category[0],
                        manufacturer: fields?.manufacturer[0],
                        unit_price: fields?.unit_price[0],
                        quantity_in_stock: fields?.quantity_in_stock[0],
                        reorder_point: fields?.reorder_point[0],
                        max_stock_level: fields?.max_stock_level[0],
                        image: newpath,
                    }).then(() => {
                        Helper.response(
                            "success",
                            "Record Created Successfully",
                            {},
                            res,
                            200
                        );
                    })

                }
            })
        });
    } catch (error) {
        Helper.response("failed", "Unable to Create Spare Parts", error, res, 200);
    }
}

exports.sparePartsList = async (req, res) => {
    try {
        const list = await spareParts.findAll({
            include: [{
                model: category,
                as: 'categories',
                attributes: ['category_name']
            }]
        });
        const data = []
        list.map((record) => {
            const values = {
                id: record.id,
                part_name: record.part_name,
                part_number: record.part_number,
                description: record.description,
                category: record.categories.category_name,
                category_id: record.category,
                manufacturer: record.manufacturer,
                unit_price: record.unit_price,
                quantity_in_stock: record.quantity_in_stock,
                reorder_point: record.reorder_point,
                max_stock_level: record.max_stock_level,
                image: record?.image?.split("/")[1]
            }

            data.push(values)
        })
        Helper.response(
            "success",
            "Record Found Successfully",
            { data },
            res,
            200
        );
    } catch (error) {
        console.log(error)
    }
}

exports.deleteSpareParts = async (req, res) => {

    try {
        const data = await spareParts.destroy({
            where: {
                id: req.body.id
            }
        })
        Helper.response(
            "success",
            "Record Deleted Successfully",
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

exports.updateSpareParts = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
          
            if (files.image != undefined) {
                const checkPartNumber = fields.part_number[0]
                const ext = files.image[0].mimetype;
                var oldpath = files.image[0].filepath
                const newpath = 'public/' + files.image[0].originalFilename + '.' + ext.split('/')[1]
                fs.rename(oldpath, newpath, function (err) {
                    if (err) {
                        Helper.response(
                            "failed",
                            "",
                            { err },
                            res,
                            200
                        );
                    } else {
                        const create = spareParts.update(
                            {

                                description: fields.description[0],
                                category: fields.category[0],
                                manufacturer: fields.manufacturer[0],
                                unit_price: fields.unit_price[0],
                                quantity_in_stock: fields.quantity_in_stock[0],
                                reorder_point: fields.reorder_point[0],
                                max_stock_level: fields.max_stock_level[0],
                                image: newpath,
                            },
                            {
                                where: { id: fields.id?.[0] }
                            }
                        ).then(() => {
                            Helper.response(
                                "success",
                                "Record Created Successfully",
                                {},
                                res,
                                200
                            );
                        }).catch((err) => {
                            Helper.response(
                                "failed",
                                `${err?.errors?.[0]?.message}`,
                                err?.errors?.[0].message,
                                res,
                                200
                            );
                        })
                    }
                })
            } else {

                const create = spareParts.update(
                    {
                        description: fields.description[0],
                        category: fields.category[0],
                        manufacturer: fields.manufacturer[0],
                        unit_price: fields.unit_price[0],
                        quantity_in_stock: fields.quantity_in_stock[0],
                        reorder_point: fields.reorder_point[0],
                        max_stock_level: fields.max_stock_level[0],
                    },
                    {
                        where: { id: fields.id?.[0] }
                    }
                ).then(() => {
                    Helper.response(
                        "success",
                        "Record Created Successfully",
                        {},
                        res,
                        200
                    );
                }).catch((err) => {
                    Helper.response(
                        "failed",
                        `Unable to update Data`,
                        err,
                        res,
                        200
                    );
                })
            }
        });

    } catch (error) {
        console.log(error)
    }
}