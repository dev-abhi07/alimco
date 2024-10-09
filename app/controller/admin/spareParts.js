const formidable = require("formidable");
const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const spareParts = require("../../model/spareParts");
const body = require('body-parser')
const fs = require('fs');
const category = require("../../model/category");
const { where } = require("sequelize");
const { kMaxLength } = require("buffer");
const labour_charges = require("../../model/labour_charges");
const uom = require("../../model/uom");


exports.createParts = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();


        form.parse(req, function (err, fields, files) {
            // console.log(fields)
            // return false
            const checkPartNumber = fields?.part_number?.[0]
            const ext = files?.image?.length > 0 ? files?.image[0]?.mimetype : 'image/jpeg'
            var oldpath = files?.image[0].filepath ?? ''
            const newpath = 'public/' + files.image[0].originalFilename
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
                        part_number: fields.part_number[0],
                        part_name: fields.part_name[0],
                        description: fields.description[0],
                        category: fields.category[0],
                        manufacturer: fields.manufacturer[0],
                        unit_price: fields.unit_price[0],                       
                        serial_no: fields.serial_no[0],
                        base_price: fields.base_price[0],
                        gst: fields.gst[0],
                        made_by: fields.made_by[0],
                        hsn_code: fields.hsn_code[0],
                        uom_id: fields.uom_id[0],
                        image: newpath,
                    }).then(() => {
                        Helper.response(
                            "success",
                            "Record Created Successfully",
                            {},
                            res,
                            200
                        );
                    }).catch((err) => {
                        console.log(err)
                        Helper.response(
                            "failed",
                            `${err?.errors?.[0]?.message}`,
                            err.errors[0].message,
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

// exports.sparePartsList = async (req, res) => {
//     try {
//         const list = await spareParts.findAll({
//             include: [{
//                 model: category,
//                 as: 'categories',
//                 attributes: ['category_name']
//             }]
//         });
//         const data = []
//         list.map((record) => {
//             const values = {
//                 id: record.id,
//                 part_name: record.part_name,
//                 part_number: record.part_number,
//                 description: record.description,
//                 category: record.categories.category_name,
//                 category_id: record.category,
//                 manufacturer: record.manufacturer,
//                 unit_price: record.unit_price,
//                 quantity_in_stock: record.quantity_in_stock,
//                 reorder_point: record.reorder_point,
//                 max_stock_level: record.max_stock_level,
//                 image: record?.image?.split("/")[1],
//                 serial_no: record.serial_no,
//                 base_price: record.base_price,
//                 gst: record.gst,
//                 made_by: record.made_by,
//                 hsn_code: record.hsn_code,
//             }

//             data.push(values)
//         })
//         Helper.response(
//             "success",
//             "Record Found Successfully",
//             { data },
//             res,
//             200
//         );
//     } catch (error) {
//         console.log(error)
//     }
// }

exports.sparePartsList = async (req, res) => {
    try {

        const list = await spareParts.findAll({
            include: [{
                model: category,
                as: 'categories',
                attributes: ['category_name']
            }]
        });

        const data = [];
        const datas = await Promise.all(list.map(async (record) => {
            const vv = await uom.findOne({ where: { id: record.uom_id } });
            const values = {
                id: record.id,
                value:record.id,
                label:record.part_name,
                part_name: record.part_name,
                part_number: record.part_number,
                description: record.description,
                category: record?.categories?.category_name,
                category_id: record.category,
                manufacturer: record.manufacturer,
                unit_price: record.unit_price,
                image: record?.image?.split("/")[1],
                serial_no: record.serial_no,
                base_price: record.base_price,
                gst: record.gst,
                made_by: record.made_by,
                hsn_code: record.hsn_code,
                uom_value: record.uom_id,
                uom_name: vv ? vv.unit_of_measurement : '-'
            };

            
            data.push(values);

        }));        
        Helper.response(
            "success",
            "Record Found Successfully",
            { data },
            res,
            200
        );
    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }
};

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
                                serial_no: fields.serial_no[0],
                                base_price: fields.base_price[0],
                                gst: fields.gst[0],
                                made_by: fields.made_by[0],
                                hsn_code: fields.hsn_code[0],
                                uom_id: fields.uom_id[0],
                                image: newpath,
                            },
                            {
                                where: { id: fields.id?.[0] }
                            }
                        ).then(() => {
                            Helper.response(
                                "success",
                                "Record Updated Successfully",
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
                        serial_no: fields.serial_no[0],
                        base_price: fields.base_price[0],
                        uom_id: fields.uom_id[0],
                        gst: fields.gst[0],
                        made_by: fields.made_by[0],
                        hsn_code: fields.hsn_code[0],
                    },
                    {
                        where: { id: fields.id?.[0] }
                    }
                ).then(() => {
                    Helper.response(
                        "success",
                        "Record Updated Successfully",
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

exports.labourCharges = async (req, res) => {
    try {
        const labourData = await labour_charges.findAll()
        Helper.response(
            "success",
            "Record Found Successfully",
            { labourData },
            res,
            200
        );
    } catch (error) {
        Helper.response(
            "failed",
            `Something went wrong!`,
            err,
            res,
            200
        );
    }
}
