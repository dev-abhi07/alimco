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
const Joi = require('joi');
const path = require('path');
const CryptoJS = require("crypto-js");
exports.createParts = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();


        form.parse(req, function (err, fields, files) {

            const imageFile = files.image ? files.image[0] : null;
            const parsedFields = {
                type_value: fields.type_value[0],
                type_label: fields.type_label[0],
                serial_no: fields.serial_no[0],
                hsn_code: fields.hsn_code[0],
                made_by: fields.made_by[0],
                part_name: fields.part_name[0],
                part_number: fields.part_number[0],
                uom_id: fields.uom_id[0],
                category: fields.category[0],
                manufacturer: fields.manufacturer[0],
                base_price: fields.base_price[0],
                gst: fields.gst[0],
                unit_price:fields.unit_price[0],
                description: fields.description[0],
            
            };

            if (imageFile) {
                parsedFields.image = {
                    originalFilename: imageFile.originalFilename,
                    mimetype: imageFile.mimetype,
                    size: imageFile.size,
                };
            } else {
                parsedFields.image = null; // or you could decide how to handle the absence of an image
            }

            const schema = Joi.object({
                type_value: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                type_label: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                serial_no: Joi.number().integer().min(1).max(100000000).required(), 
                hsn_code: Joi.number().integer().min(1).max(100000000).required(), 
                made_by: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                part_name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                part_number: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                uom_id:  Joi.number().integer().min(1).max(100000).required(), 
                category:  Joi.number().integer().min(1).max(100000).required(),
                manufacturer: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                base_price: Joi.number().positive().precision(2).required(),
                gst: Joi.number().positive().precision(2).required(), 
                unit_price: Joi.number().positive().precision(2).required(),              
               
                image: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional(),
                description: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
            });

            // Validate the incoming fields


          
            const { error } = schema.validate(parsedFields);
           
    
            if (error) {
                return Helper.response("failed", error.details[0].message, {}, res, 200);
            }

            const checkPartNumber = fields?.part_number?.[0]
            const ext = files?.image?.length > 0 ? files?.image[0]?.mimetype : 'image/jpeg'
            var oldpath = files?.image[0].filepath ?? ''
            const newpath = 'public/' + files.image[0].originalFilename

             //extention
             const imageFileext = files.image[0];
             const fileExtension = path.extname(imageFileext.originalFilename).toLowerCase(); // Get the extension
             const mimeType = imageFileext.mimetype.toLowerCase(); // Get the MIME type

             // Define allowed file extensions and MIME types
             const allowedExtensions = ['.jpeg', '.jpg', '.png'];
             const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

             // Check if the extension is valid
             if (!allowedExtensions.includes(fileExtension)) {
                 return Helper.response(
                     "failed",
                     "Invalid file extension. Only JPEG, JPG, and PNG files are allowed.",
                     {},
                     res,
                     200
                 );
             }

             // Check if the MIME type matches the file extension
             if (!allowedMimeTypes.includes(mimeType)) {
                 return Helper.response(
                     "failed",
                     "MIME type does not match the file extension. Only JPEG, JPG, and PNG files are allowed.",
                     {},
                     res,
                     200
                 );
             }


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
                        type:fields.type_value[0],
                        type_label:fields.type_label[0],
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
//         // Extract pagination parameters with default values
      
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const offset = (page - 1) * limit;

//         // Fetch paginated spare parts
//         const { count, rows: sparePart } = await spareParts.findAndCountAll({
//             include: [
//                 {
//                     model: category,
//                     as: 'categories',
//                     attributes: ['category_name'],
//                 },
//             ],
//             offset,
//             limit,
//         });

//         // Format the data
//         const data = await Promise.all(sparePart.map(async (record) => {
//             const uomDetails = await uom.findOne({ where: { id: record.uom_id } });
//             return {
//                 id: record.id,
//                 value: record.id,
//                 label: record.part_name,
//                 part_name: record.part_name,
//                 part_number: record.part_number,
//                 description: record.description,
//                 category: record?.categories?.category_name,
//                 category_id: record.category,
//                 manufacturer: record.manufacturer,
//                 unit_price: record.unit_price,
//                 image: record?.image?.split("/")[1],
//                 serial_no: record.serial_no,
//                 base_price: record.base_price,
//                 gst: record.gst,
//                 made_by: record.made_by,
//                 hsn_code: record.hsn_code,
//                 uom_value: record.uom_id,
//                 uom_name: uomDetails ? uomDetails.unit_of_measurement : '-',
//                 type: record.type,
//                 label1: "RTU",
//             };
//         }));

//         // Send paginated response
//         Helper.response("success", "Records Found Successfully", {
//             currentPage: page,
//             totalPages: Math.ceil(count / limit),
//             totalRecords: count,
//             data,
//         }, res, 200);

//     } catch (error) {
//         console.error(error);
//         Helper.response("failed", "Something went wrong!", { error }, res, 500);
//     }
// };



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
   
            // const encryptedId = CryptoJS.AES.encrypt(record.id.toString(), process.env.SECRET_KEY).toString();
           
            const values = {
                id:  record.id,
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
                uom_name: vv ? vv.unit_of_measurement : '-',
                type:record.type,
                label1:"RTU"
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
        function decryptWithIV(ivCiphertext) {
            const key = process.env.SECRET_KEY;
            const [ivHex, ciphertext] = ivCiphertext.split(':'); // Split to get IV and encrypted text

            const iv = CryptoJS.enc.Hex.parse(ivHex); // Convert IV from hex string back to WordArray

            // Decrypt using the IV and key
            const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
                iv: iv
            });

            return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)); // Parse the decrypted JSON string
        }
exports.updateSpareParts = async (req, res) => {
   
    try {
        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            const imageFile = files.image ? files.image[0] : null;


        const a = CryptoJS.AES.decrypt(fields.id[0], process.env.SECRET_KEY);
        const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
     
          const requestData = {
            id: b.id,
            key:b.key,
          };
     
        const key = requestData.key ;
       
         
            const parsedFields = {
                id:  requestData.id,
                type: fields.type[0],
                serial_no: fields.serial_no[0],
                hsn_code: fields.hsn_code[0],
                made_by: fields.made_by[0],
                part_name: fields.part_name[0],
                part_number: fields.part_number[0],
                uom_id: fields.uom_id[0],
                category: fields.category[0],
                manufacturer: fields.manufacturer[0],
                base_price: fields.base_price[0],
                gst: fields.gst[0],
                unit_price:fields.unit_price[0],
                description: fields.description[0],
            };

            if (imageFile) {
                parsedFields.image = {
                    originalFilename: imageFile.originalFilename,
                    mimetype: imageFile.mimetype,
                    size: imageFile.size,
                };
            } else {
                parsedFields.image = null; // or you could decide how to handle the absence of an image
            }
            
            const schema = Joi.object({
                id: Joi.required(), 
                type: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                serial_no: Joi.number().integer().min(1).max(100000000).required(), 
                hsn_code: Joi.number().integer().min(1).max(100000000).required(), 
                made_by: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                part_name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                part_number: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                uom_id:  Joi.number().integer().min(1).max(100000).required(), 
                category:  Joi.number().integer().min(1).max(100000).required(),
                manufacturer: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                base_price: Joi.number().positive().precision(2).required(),
                gst: Joi.number().positive().precision(2).required(), 
                unit_price: Joi.number().positive().precision(2).required(),
                image: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                description: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
            });

            // Validate the incoming fields

           
            const { error } = schema.validate(parsedFields);
    
            if (error) {
               return Helper.response("failed", error.details[0].message, {}, res, 200);
                // return Helper.response("failed", 'hgkjhj', {}, res, 200);
            }
            if (files.image != undefined) {
                const checkPartNumber = fields.part_number[0]
                const ext = files.image[0].mimetype;
                var oldpath = files.image[0].filepath
                const newpath = 'public/' + files.image[0].originalFilename + '.' + ext.split('/')[1]

              //extention
                const imageFileext = files.image[0];
                const fileExtension = path.extname(imageFileext.originalFilename).toLowerCase(); // Get the extension
                const mimeType = imageFileext.mimetype.toLowerCase(); // Get the MIME type

                // Define allowed file extensions and MIME types
                const allowedExtensions = ['.jpeg', '.jpg', '.png'];
                const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

                // Check if the extension is valid
                if (!allowedExtensions.includes(fileExtension)) {
                    return Helper.response(
                        "failed",
                        "Invalid file extension. Only JPEG, JPG, and PNG files are allowed.",
                        {},
                        res,
                        200
                    );
                }

                // Check if the MIME type matches the file extension
                if (!allowedMimeTypes.includes(mimeType)) {
                    return Helper.response(
                        "failed",
                        "MIME type does not match the file extension. Only JPEG, JPG, and PNG files are allowed.",
                        {},
                        res,
                        200
                    );
                }

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
                                type:fields.type[0],
                                image: newpath,
                            },
                            {
                                where: { id:  requestData.id }
                            }
                        ).then(() => {
                            Helper.response(
                                "success",
                                "Record Updated Successfully",
                                { key},
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
                        type:fields.type[0],
                    },
                    {
                        where: { id: requestData.id }
                    }
                ).then(() => {
                    Helper.response(
                        "success",
                        "Record Updated Successfully",
                        {key},
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
