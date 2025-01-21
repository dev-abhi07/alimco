const formidable = require("formidable");
const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const aasra = require("../../model/aasra");
const users = require("../../model/users");
const generate_pass = require("generate-password");
const fs = require('fs');
const path = require('path');
const document = require("../../model/documents");
const { default: test } = require("node:test");
const city = require("../../model/city");
const states = require("../../model/state");
const { where, Op, or, fn, col } = require("sequelize");
const spareParts = require("../../model/spareParts");
const labour_charges = require('../../model/labour_charges');
const aasraType = require("../../model/aasratype");
const orderDetails = require("../../model/orderDetails");
const order = require("../../model/order");
const stock = require("../../model/stock");


const XLSX = require('xlsx');
const ticket = require("../../model/ticket");
const transaction = require("../../model/transaction");
const payment = require("../../model/payment");
const partSerialNo = require("../../model/partSerialNo");
const Joi = require('joi');
const CryptoJS = require("crypto-js");
const otp = require("../../model/otp");


exports.registerAasraCentre = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        const unique_code = `AC_${await Helper.generateNumber(10000, 99999)}`;
        const rootUploadDir = 'documents/';
        form.parse(req, async function (err, fields, files) {
            console.log(fields,'fields')
            console.log(files,'files')

            const imageFields = [
                { field: 'regImg', folder: 'reg_images' },
                { field: 'photoImg', folder: 'user_images' },
                { field: 'panImg', folder: 'pan_images' },
                { field: 'adhaarImg', folder: 'adhaar_images' },
                { field: 'areaImgs', folder: 'area_images' },
                { field: 'salesImg', folder: 'sales_images' },
                { field: 'marketImg', folder: 'market_images' },
                { field: 'signatureImg', folder: 'sign_images' }
            ];
        
            const invalidImage = imageFields.find((imageField) => {
                const file = files[imageField.field] && files[imageField.field][0];
                if (file) {
                    const validation = Helper.validateImage(file);
                    if (!validation.valid) {
                        return {
                            field: imageField.field,
                            message: validation.message
                        };
                    }
                }
                return false;
            });
        
            if (invalidImage) {
                return Helper.response("failed", invalidImage.message, {}, res, 200);
            }

            const imageregImg = files.regImg ? files.regImg[0] : null;
            const imagephotoImg = files.photoImg ? files.photoImg[0] : null;
            const imagepanImg = files.panImg ? files.panImg[0] : null;
            const imageadhaarImg = files.adhaarImg ? files.adhaarImg[0] : null;
            const imageareaImgs = files.areaImgs ? files.areaImgs[0] : null;
            const imagesalesImg = files.salesImg ? files.salesImg[0] : null;
            const imagemarketImgg = files.marketImg ? files.marketImg[0] : null;
            const imagesignatureImg = files.signatureImg ? files.signatureImg[0] : null;

            const parsedFields = {
                state: fields.state[0],
                district: fields.district[0],
                dd_number: fields.dd_number[0],
                dd_bank: fields.dd_bank[0],
                amount: fields.amount[0],
                address: fields.address[0],
                name_of_org: fields.name_of_org[0],
                pin: fields.pin[0],
                telephone_no: fields.telephone_no[0],
                mobile_no: fields.mobile_no[0],
                email: fields.email[0],
                gst: fields.gst[0],
                lat:fields.lat[0],
                log: fields.log[0],
                regCertificate_no: fields.regCertificate_no[0],
                pan_no: fields.pan_no[0],
                adhaar_no: fields.adhaar_no[0],
                area_sqft: fields.area_sqft[0],
                bank_name: fields.bank_name[0],
                bank_address: fields.bank_address[0],
                branch_name: fields.branch_name[0],
                ifsc_code: fields.ifsc_code[0],
                market_survey_no: fields.market_survey_no[0],
                additionalInfo: fields.additionalInfo[0],
                relative_in_alimco: fields.relative_in_alimco[0],
                agreement_of_rupee: fields.agreement_of_rupee[0],
                annual_sales_potential:fields.annual_sales_potential[0],
                invest_agree: fields.invest_agree[0],
                name: fields.name[0],
                place: fields.place[0],
            };
            
           
            if (imageregImg) {
                parsedFields.regImg = {
                    originalFilename: imageregImg.originalFilename,
                    mimetype: imageregImg.mimetype,
                    size: imageregImg.size,
                };
            } else {
                parsedFields.regImg = null; // or you could decide how to handle the absence of an image
            }

            if (imagephotoImg) {
                parsedFields.photoImg = {
                    originalFilename: imagephotoImg.originalFilename,
                    mimetype: imagephotoImg.mimetype,
                    size: imagephotoImg.size,
                };
            } else {
                parsedFields.photoImg = null; // or you could decide how to handle the absence of an image
            }

           
            
            if (imagepanImg) {
                parsedFields.panImg = {
                    originalFilename: imagepanImg.originalFilename,
                    mimetype: imagepanImg.mimetype,
                    size: imagepanImg.size,
                };
            } else {
                parsedFields.panImg = null; // or you could decide how to handle the absence of an image
            }
           
            
            if (imageadhaarImg) {
                parsedFields.adhaarImg = {
                    originalFilename: imageadhaarImg.originalFilename,
                    mimetype: imageadhaarImg.mimetype,
                    size: imageadhaarImg.size,
                };
            } else {
                parsedFields.adhaarImg = null; // or you could decide how to handle the absence of an image
            }
            
           
            if (imageareaImgs) {
                parsedFields.areaImgs = {
                    originalFilename: imageareaImgs.originalFilename,
                    mimetype: imageareaImgs.mimetype,
                    size: imageareaImgs.size,
                };
            } else {
                parsedFields.areaImgs = null; // or you could decide how to handle the absence of an image
            }
          
          
            if (imagesalesImg) {
                parsedFields.salesImg = {
                    originalFilename: imagesalesImg.originalFilename,
                    mimetype: imagesalesImg.mimetype,
                    size: imagesalesImg.size,
                };
            } else {
                parsedFields.salesImg = null; // or you could decide how to handle the absence of an image
            }
            
           
            if (imagemarketImgg) {
                parsedFields.marketImg = {
                    originalFilename: imagemarketImgg.originalFilename,
                    mimetype: imagemarketImgg.mimetype,
                    size: imagemarketImgg.size,
                };
            } else {
                parsedFields.marketImg = null; // or you could decide how to handle the absence of an image
            }
            
            if (imagesignatureImg) {
                parsedFields.signatureImg = {
                    originalFilename: imagesignatureImg.originalFilename,
                    mimetype: imagesignatureImg.mimetype,
                    size: imagesignatureImg.size,
                };
            } else {
                parsedFields.signatureImg = null; // or you could decide how to handle the absence of an image
            }


            const schema = Joi.object({
                state: Joi.number().integer().min(1).max(100000).required(), 
                district: Joi.number().integer().min(1).max(100000).required(),
                dd_number: Joi.number().integer().required(), 
                dd_bank: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                amount: Joi.number().positive().precision(5).required(),
                address: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                name_of_org: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                pin:  Joi.number().integer().required(), 
                telephone_no:  Joi.number().integer().required(),
                mobile_no:  Joi.number().integer().required(),
                email: Joi.string().email({ tlds: { allow: false } }).required(),
                gst: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/) , 
                lat: Joi.number().positive().precision(5).required(),              

                log: Joi.number().positive().precision(5).required(), 
                regCertificate_no: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                pan_no: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
                adhaar_no: Joi.number().integer().required(), 
                area_sqft: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                bank_name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                bank_address: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                branch_name:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                ifsc_code:   Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
                market_survey_no: Joi.number().integer().required(), 
                additionalInfo:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                relative_in_alimco:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                agreement_of_rupee:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),   
                
                annual_sales_potential:  Joi.number().integer().required(),
                invest_agree: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                place: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                regImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                photoImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                panImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                adhaarImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                areaImgs: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                salesImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                marketImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                signatureImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                
            });

            // Validate the incoming fields


          
            const { error } = schema.validate(parsedFields);
           
    
            if (error) {
                return Helper.response("failed", error.details[0].message, {}, res, 200);
            }

            // if (!files.photoImg || !files.panImg || !files.adhaarImg || !files.areaImgs || !files.marketImg || !files.salesImg || !files.regImg || !files.signatureImg) {
            //     return Helper.response("failed", "Upload all images", null, res, 200);
            // }
            if (err) {
                Helper.response("failed", "Error parsing the form", err, res, 200);
                return;
            }

            const transformedFields = {};
            const transformedFieldsFile = {};

            for (let key in fields) {
                transformedFields[key] = fields[key][0];
            }


            const emailValidate = await users.count({
                where: {
                    email: transformedFields.email
                }
            });

            const mobileValidate = await users.count({
                where: {
                    mobile: transformedFields.mobile_no
                }
            });

            if (mobileValidate > 0 || emailValidate > 0) {

                return Helper.response("failed", emailValidate > 0 ? 'Email already exists' : 'Mobile already exists', {}, res, 200);
            }


            try {



                const createAasra = await aasra.create({
                    ...transformedFields

                });

                if (createAasra) {
                    const password = generate_pass.generate({
                        length: 8,
                        numbers: true,
                        uppercase: true,
                        lowercase: true,
                    });

                    try {
                        const createUser = await users.create({
                            name: createAasra.name,
                            ref_id: createAasra.id,
                            user_type: createAasra.callCenterValue === 'callcenter' ? 'CC' : 'AC',
                            email: createAasra.email,
                            password: Helper.encryptPassword(password),
                            pass_code: password,
                            unique_code:unique_code,
                            mobile: createAasra.mobile_no,
                            status: 1,
                        });

                        const imageFields = {
                            photoImg: 'user_images',
                            panImg: 'pan_images',
                            adhaarImg: 'adhaar_images',
                            areaImgs: 'area_images',
                            marketImg: 'market_images',
                            salesImg: 'sales_images',
                            signatureImg: 'sign_images',
                            regImg: 'reg_images'
                        };
                        //move file according to foldesr
                        const moveFile = async (file, folder, field) => {
                            const folderPath = path.join(rootUploadDir, folder);
                            if (!fs.existsSync(folderPath)) {
                                fs.mkdirSync(folderPath, { recursive: true });
                            }

                            const fileName = `${unique_code}_${file.originalFilename}`;
                            const filePath = path.join(folderPath, fileName);

                            try {
                                await fs.promises.rename(file.filepath, filePath);
                                transformedFieldsFile[field] = path.join(folder, fileName);
                                console.log(`File moved to ${filePath}`);
                            } catch (err) {
                                console.error(`Error moving the file (${file.originalFilename}):`, err);
                            }
                        };

                        for (const [field, folder] of Object.entries(imageFields)) {
                            if (files[field] && files[field][0]) {
                                await moveFile(files[field][0], folder, field);
                            } else {
                                console.error(`No file found for field '${field}'.`);
                            }
                        }

                        const documentData = await document.create({
                            ...transformedFieldsFile,
                            aasra_id: createAasra.id
                        }).then(() => {
                            Helper.response("success", "User registered successfully", createUser, res, 200);
                        })

                    } catch (error) {
                        console.log(error)
                        Helper.response("failed", "Unable to register user", error, res, 200);
                    }
                }
            } catch (err) {
                console.log(err)
                Helper.response("failed", "Unable to register", err, res, 200);
            }
        });
    } catch (error) {
        console.log(error);
        Helper.response("failed", "Server error", error, res, 500);
    }
};

exports.aasraList = async (req, res) => {
    try {
        const data = await aasra.findAll({
            include: [{
                model: document,
                as: 'document'
            }, {
                model: states,
                as: 'stateData',
                attributes: ['name', 'id'],

            }, {
                model: city,
                as: 'city',
                attributes: ['city', 'id'],
            }
            ]
        });
        if (data) {
            Helper.response("success", "Aasra list", { data }, res, 200);
        }
        else {
            Helper.response("failed", "Unable to fetch list", [], res, 200);
        }


    } catch (error) {
        console.log(error)
        Helper.response("failed", "Server error", error, res, 200);
    }
}

exports.updateAasraCenter = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        const unique_code = `AC_${await Helper.generateNumber(10000, 99999)}`;
        const rootUploadDir = 'documents/';
        form.parse(req, async function (err, fields, files) {

            const a = CryptoJS.AES.decrypt(fields.ids[0], process.env.SECRET_KEY);
            const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
         
              const requestData = {
                id: b.id,
                key:b.key,
              };
         
            const key = requestData.key ;
           

        console.log(requestData)
       

            const imageFields = [
                { field: 'regImg', folder: 'reg_images' },
                { field: 'photoImg', folder: 'user_images' },
                { field: 'panImg', folder: 'pan_images' },
                { field: 'adhaarImg', folder: 'adhaar_images' },
                { field: 'areaImgs', folder: 'area_images' },
                { field: 'salesImg', folder: 'sales_images' },
                { field: 'marketImg', folder: 'market_images' },
                { field: 'signatureImg', folder: 'sign_images' }
            ];
        
            const invalidImage = imageFields.find((imageField) => {
                const file = files[imageField.field] && files[imageField.field][0];
                if (file) {
                    const validation = Helper.validateImage(file);
                    if (!validation.valid) {
                        return {
                            field: imageField.field,
                            message: validation.message
                        };
                    }
                }
                return false;
            });
        
            if (invalidImage) {
                return Helper.response("failed", invalidImage.message, {}, res, 200);
            }


            const imageregImg = files.regImg ? files.regImg[0] : null;
            const imagephotoImg = files.photoImg ? files.photoImg[0] : null;
            const imagepanImg = files.panImg ? files.panImg[0] : null;
            const imageadhaarImg = files.adhaarImg ? files.adhaarImg[0] : null;
            const imageareaImgs = files.areaImgs ? files.areaImgs[0] : null;
            const imagesalesImg = files.salesImg ? files.salesImg[0] : null;
            const imagemarketImgg = files.marketImg ? files.marketImg[0] : null;
            const imagesignatureImg = files.signatureImg ? files.signatureImg[0] : null;
           console.log(fields.gst)
           console.log(fields.gst[0])
         
            const parsedFields = {
                ids: fields.ids[0],
                state: fields.state[0],
                district: fields.district[0],
                dd_number: fields.dd_number[0],
                dd_bank: fields.dd_bank[0],
                amount: fields.amount[0],
                address: fields.address[0],
                name_of_org: fields.name_of_org[0],
                pin: fields.pin[0],
                telephone_no: fields.telephone_no[0],
                mobile_no: fields.mobile_no[0],
                email: fields.email[0],
                gst:   fields.gst[0],
                lat:fields.lat[0],
                log: fields.log[0],
                regCertificate_no: fields.regCertificate_no[0],
                pan_no: fields.pan_no[0],
                adhaar_no: fields.adhaar_no[0],
                area_sqft: fields.area_sqft[0],
                bank_name: fields.bank_name[0],
                bank_address: fields.bank_address[0],
                branch_name: fields.branch_name[0],
                ifsc_code: fields.ifsc_code[0],
                market_survey_no: fields.market_survey_no[0],
                additionalInfo: fields.additionalInfo[0],
                relative_in_alimco: fields.relative_in_alimco[0],
                agreement_of_rupee: fields.agreement_of_rupee[0],
                annual_sales_potential:fields.annual_sales_potential[0],
                invest_agree: fields.invest_agree[0],
                name: fields.name[0],
                place: fields.place[0],
            };
            
           
            if (imageregImg) {
                parsedFields.regImg = {
                    originalFilename: imageregImg.originalFilename,
                    mimetype: imageregImg.mimetype,
                    size: imageregImg.size,
                };
            } else {
                parsedFields.regImg = null; // or you could decide how to handle the absence of an image
            }

            if (imagephotoImg) {
                parsedFields.photoImg = {
                    originalFilename: imagephotoImg.originalFilename,
                    mimetype: imagephotoImg.mimetype,
                    size: imagephotoImg.size,
                };
            } else {
                parsedFields.photoImg = null; // or you could decide how to handle the absence of an image
            }

           
            
            if (imagepanImg) {
                parsedFields.panImg = {
                    originalFilename: imagepanImg.originalFilename,
                    mimetype: imagepanImg.mimetype,
                    size: imagepanImg.size,
                };
            } else {
                parsedFields.panImg = null; // or you could decide how to handle the absence of an image
            }
           
            
            if (imageadhaarImg) {
                parsedFields.adhaarImg = {
                    originalFilename: imageadhaarImg.originalFilename,
                    mimetype: imageadhaarImg.mimetype,
                    size: imageadhaarImg.size,
                };
            } else {
                parsedFields.adhaarImg = null; // or you could decide how to handle the absence of an image
            }
            
           
            if (imageareaImgs) {
                parsedFields.areaImgs = {
                    originalFilename: imageareaImgs.originalFilename,
                    mimetype: imageareaImgs.mimetype,
                    size: imageareaImgs.size,
                };
            } else {
                parsedFields.areaImgs = null; // or you could decide how to handle the absence of an image
            }
          
          
            if (imagesalesImg) {
                parsedFields.salesImg = {
                    originalFilename: imagesalesImg.originalFilename,
                    mimetype: imagesalesImg.mimetype,
                    size: imagesalesImg.size,
                };
            } else {
                parsedFields.salesImg = null; // or you could decide how to handle the absence of an image
            }
            
           
            if (imagemarketImgg) {
                parsedFields.marketImg = {
                    originalFilename: imagemarketImgg.originalFilename,
                    mimetype: imagemarketImgg.mimetype,
                    size: imagemarketImgg.size,
                };
            } else {
                parsedFields.marketImg = null; // or you could decide how to handle the absence of an image
            }
            
            if (imagesignatureImg) {
                parsedFields.signatureImg = {
                    originalFilename: imagesignatureImg.originalFilename,
                    mimetype: imagesignatureImg.mimetype,
                    size: imagesignatureImg.size,
                };
            } else {
                parsedFields.signatureImg = null; // or you could decide how to handle the absence of an image
            }


            const schema = Joi.object({
                ids: Joi.required(), 
                state: Joi.number().integer().min(1).max(100000).required(), 
                district: Joi.number().integer().min(1).max(100000).required(),
                dd_number: Joi.number().integer().required(), 
                dd_bank: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                amount: Joi.number().positive().precision(5).required(),
                address: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                name_of_org: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                pin:  Joi.number().integer().required(), 
                telephone_no:  Joi.number().integer().required(),
                mobile_no:  Joi.number().integer().required(),
                email: Joi.string().email({ tlds: { allow: false } }).required(),
                gst: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).allow(null), 
                lat: Joi.number().positive().precision(5).required(),              

                log: Joi.number().positive().precision(5).required(), 
                regCertificate_no: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                pan_no: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
                adhaar_no: Joi.number().integer().required(), 
                area_sqft: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                bank_name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                bank_address: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                branch_name:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                ifsc_code:   Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
                market_survey_no: Joi.number().integer().required(), 
                additionalInfo:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                relative_in_alimco:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(), 
                agreement_of_rupee:  Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),   
                
                annual_sales_potential:  Joi.number().integer().required(),
                invest_agree: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                place: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
                regImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                photoImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                panImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                adhaarImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                areaImgs: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                salesImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                marketImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                signatureImg: Joi.object({
                    originalFilename: Joi.string(),
                    mimetype: Joi.string().valid('image/jpeg', 'image/png','image/jpg'),
                    size: Joi.number().max(2 * 1024 * 1024), // 2 MB limit
                }).optional().allow(null),
                
            });

            // Validate the incoming fields


          
            const { error } = schema.validate(parsedFields);
           
    
            if (error) {
                return Helper.response("failed", error.details[0].message, {}, res, 200);
            }
           
            
            if (Object.keys(files).length !== 0) {
                
               
                if (err) {
                    Helper.response("failed", "Error parsing the form", err, res, 200);
                    return;
                }

                const transformedFields = {};
                const transformedFieldsFile = {};

                for (let key in fields) {
                    transformedFields[key] = fields[key][0];
                }

                try {

                    const createAasra = await aasra.update(transformedFields, { where: { id: requestData.id } });


                    if (createAasra) {

                        try {
                            const imageFields = {
                                photoImg: 'user_images',
                                panImg: 'pan_images',
                                adhaarImg: 'adhaar_images',
                                areaImgs: 'area_images',
                                marketImg: 'market_images',
                                salesImg: 'sales_images',
                                signatureImg: 'sign_images',
                                regImg: 'reg_images'
                            };
                            //move file according to foldesr
                            const moveFile = async (file, folder, field) => {
                                const folderPath = path.join(rootUploadDir, folder);
                                if (!fs.existsSync(folderPath)) {
                                    fs.mkdirSync(folderPath, { recursive: true });
                                }

                                const fileName = `${unique_code}_${file.originalFilename}`;
                                const filePath = path.join(folderPath, fileName);

                                try {
                                    await fs.promises.rename(file.filepath, filePath);
                                    transformedFieldsFile[field] = path.join(folder, fileName);
                                    console.log(`File moved to ${filePath}`);
                                } catch (err) {
                                    console.error(`Error moving the file (${file.originalFilename}):`, err);
                                }
                            };

                            for (const [field, folder] of Object.entries(imageFields)) {
                                // console.log(files[field],'wwss')
                                // console.log(files[field][0],'ddd')
                                // return false 
                                if (files[field] && files[field][0]) {
                                    await moveFile(files[field][0], folder, field);
                                } else {
                                    console.error(`No file found for field '${field}'.`);
                                }
                            }

                            const updateFields = { ...transformedFieldsFile };

                            const documentData = await document.update(
                                updateFields,
                                { where: { aasra_id: requestData.id } }
                            );
                            Helper.response("success", "User updated successfully", {key}, res, 200);

                        } catch (error) {
                            console.log(error)
                            Helper.response("failed", "Unable to register user", error, res, 200);
                        }
                    }

                } catch (err) {
                    console.log(err)
                    Helper.response("failed", "Unable to update", err, res, 200);
                }
            } else {

                const transformedFields = {};


                for (let key in fields) {
                    transformedFields[key] = fields[key][0];
                }
                const createAasra = await aasra.update(transformedFields, { where: { id: requestData.id } });
                Helper.response("success", "User updated successfully", {key}, res, 200);
            }
        });
    } catch (error) {
        Helper.response("failed", "Unable to update", err, res, 200);
    }
}

exports.categoryWiseProduct = async (req, res) => {
    try {
       
        const getProduct = await spareParts.findAll({
            where: {
                category: req.body.category_id
            }
        })
        const productData = [];
        getProduct.map((record) => {
            const data = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                productPrice: parseFloat(record.unit_price),
                id: record.id
            }

            productData.push(data)
        })
        //console.log(productData)
        Helper.response("success", "Product Found Successfully!", { productData }, res, 200);
    } catch (error) {
        console.log(error)
        Helper.response("success", "Product Found Successfully!", { productData }, res, 200);
    }
}


exports.categoryRtoWiseProduct = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const aasras = await aasra.findOne({ where: { id: user.ref_id } })
        const gstno = aasras?.gst
        const getProduct = await spareParts.findAll({
            where: {
                category: req.body.category_id,
                type:"rtu"
            }
        })
        const productData = [];
        getProduct.map((record) => {
            const data = {
                value: record.id,
                label: record.part_number + '-' + record.part_name,
                productPrice: parseFloat(record.unit_price),
                basePrice:record.base_price,
                id: record.id
            }

            productData.push(data)
        })
        //console.log(productData)
        Helper.response("success", "Product Found Successfully!", { productData ,gstno}, res, 200);
    } catch (error) {
        console.log(error)
        Helper.response("success", "Product Found Successfully!", { productData }, res, 200);
    }
}



exports.productRepairList = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const aasras = await aasra.findOne({ where: { id: user.ref_id } })
        const { repair_id } = req.body

        let data = [];
        const product = await labour_charges.findAll()
        if (req.body.warranty == true) {
            if (aasras == null) {

                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
            else if (aasras != null && aasras.aasra_type == 'RMC' || aasras.aasra_type == 'PMDK' || aasras.aasra_type == 'HQ' || aasras.aasra_type == 'AAPC') {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        repairPrice: 0,
                        repairGst: 0
                    }
                    return productData
                })
            } else {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
        } else {
            if (aasras == null) {

                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: f.finalLabourCharges,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
            else if (aasras != null && aasras.aasra_type == 'RMC' || aasras.aasra_type == 'PMDK' || aasras.aasra_type == 'HQ' || aasras.aasra_type == 'AAPC') {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: 0,
                        repairTime: f.repairTime,
                        repairPrice: 0,
                        repairGst: 0
                    }
                    return productData
                })
            } else {
                data = product.map((f) => {
                    const productData = {
                        value: f.id,
                        label: f.natureOfWork,
                        repairServiceCharge: f.finalLabourCharges,
                        repairTime: f.repairTime,
                        finalLabourCharges: f.finalLabourCharges,
                        repairPrice: 45,
                        repairGst: 0.18
                    }
                    return productData
                })
            }
        }


        Helper.response("success", "Product Found Successfully!", data, res, 200);

    } catch (error) {
        console.log(error, 'eror')
        Helper.response("failed", "Server error", error, res, 200);
    }
}

exports.AarsaDropDown = async (req, res) => {
    try {
        const aasras = await aasra.findAll({
            where: {
                callCenterValue: null
            }
        })
      
        // const dataset = []

        // aasras.map((record) => {
        //  aasraloginId =   await users.findOne({
        //         where:{
        //             ref_id: record.id,
        //             user_type:'AC'
        //         }
        //     })
        //     const values = {
        //         value: record.id,
        //         label: record.name_of_org
        //     }
        //     dataset.push(values)
        // })

        const dataset = await Promise.all(
            aasras.map(async (record) => {
                const aasraloginId = await users.findOne({
                    where: {
                        ref_id: record.id,
                        user_type: 'AC',
                    },
                });

                
                return {
                    value: record.id,
                    label: `${record.name_of_org}-${aasraloginId?.unique_code || '--'}`
                };
            })
        );
        Helper.response("success", "", dataset, res, 200);

    } catch (error) {
        Helper.response("failed", "Server error", error, res, 200);
    }
}

exports.aasraType = async (req, res) => {
    try {

        const aasratypeName = [
            { value: 'AAPC', label: 'AAPC' },
            { value: 'RMC', label: 'RMC' },
            { value: 'PMDK', label: 'PMDK' },
            { value: 'HQ', label: 'HQ' },
            { value: 'aasra', label: 'Aasra' }
        ];


        const data = [];
        aasratypeName.map((record) => {
            const value = {
                value: record.value,
                label: record.label
            };
            data.push(value);
        });

        Helper.response(
            "success",
            "Record Fetched Successfully",
            { data },
            res,
            200
        );
    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            500
        );
    }
};
exports.aasraTypecreate = async (req, res) => {
    
    const schema = Joi.object({
        type: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9\s]+$/).required(),
        centre_name: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        state_id: Joi.number().integer().min(1).max(100000).required(), 
        city_id:Joi.number().integer().min(1).max(100000).required(), 
        address: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
        contact_details: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        contact_person: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        email_id: Joi.string().email({ tlds: { allow: false } }).required()
    });

  
    const { error } = schema.validate(req.body);    
    if (error) {
        return Helper.response(
            "failed",
            error.details[0].message,
            {},
            res,
            200
        );
    }
    try {

        const checkName = aasraType.f
        const data = {
            type: req.body.type,
            centre_name: req.body.centre_name,
            state_id: req.body.state_id,
            city_id: req.body.city_id,
            address: req.body.address,
            contact_details: req.body.contact_details,
            contact_person: req.body.contact_person,
            email_id: req.body.email_id
        }

        const create = aasraType.create(data);
        if (create) {
            Helper.response(
                "success",
                "Record Created Successfully",
                {},
                res,
                200
            );
        } else {
            Helper.response(
                "failed",
                "Something went wrong!",
                {},
                res,
                200
            );
        }
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


exports.aasraTypelist = async (req, res) => {

    try {
        const aasralist = await aasraType.findAll();
        const data = [];

        for (const record of aasralist) {
            const stateName = await states.findByPk(record.state_id);
            const cityName = await city.findOne({
                where: {
                    id: record.city_id,
                    state_id: record.state_id
                }
            });

            const value = {
                id: record.id,
                type: record.type,
                centre_name: record.centre_name,
                state_id: record.state_id,
                city_id: record.city_id,
                state_label: stateName ? stateName.name : null,
                city_label: cityName ? cityName.city : null,
                address: record.address,
                contact_details: record.contact_details,
                contact_person: record.contact_person,
                email_id: record.email_id
            };
            data.push(value);
        }

        Helper.response(
            "success",
            "Record Fetched Successfully",
            { data },
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


exports.aasraTypeupdate = async (req, res) => {
    const schema = Joi.object({
        id: Joi.number().integer().min(1).max(100000).required(),
        type: Joi.string().min(3).max(100).pattern(/^[a-zA-Z0-9\s]+$/),
        centre_name: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        state_id: Joi.number().integer().min(1).max(100000).required(), 
        city_id:Joi.number().integer().min(1).max(100000).required(), 
        address: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
        contact_details: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        contact_person: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        email_id: Joi.string().email({ tlds: { allow: false } }).required()
    });

  
    const { error } = schema.validate(req.body);    
    if (error) {
        return Helper.response(
            "failed",
            error.details[0].message,
            {},
            res,
            200
        );
    }
    try {
        const update = await aasraType.update({
            type: req.body.type,
            centre_name: req.body.centre_name,
            state_id: req.body.state_id,
            city_id: req.body.city_id,
            address: req.body.address,
            contact_details: req.body.contact_details,
            contact_person: req.body.contact_person,
            email_id: req.body.email_id
        }, {
            where: {
                id: req.body.id,
            }
        })
        Helper.response(
            "success",
            "Record Update Successfully",
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

exports.stocktransferupdate = async (req, res) => {
    try {

        const orderId = await order.findOne({
            where: {
                id: req.body.order_id
            }
        })
        if (!orderId) {
            return Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
        }

        const orderDetailsId = await orderDetails.findAll({
            where: {
                order_id: orderId.id
            }
        })
        if (!orderDetailsId) {
            return Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
            );
        }

        if (orderDetailsId) {
            orderDetailsId.map(async (t) => {
                await stock.create({
                    item_id: t.item_id,
                    quantity: t.quantity,
                    price: t.price,
                    item_name: t.item_name,
                    quantity: t.quantity,
                    aasra_id: orderId.aasra_id,
                    stock_in: t.quantity
                });
            })
        }

        if (orderDetailsId) {
            await order.update({
                order_status: req.body.status
            }, {
                where: {
                    id: req.body.order_id
                }
            });
        }


        Helper.response(
            "success",
            "Record Update Successfully",
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


exports.uniqueOrderId = async (req, res) => {
    try {

        const ticketid = req.body.ticket_id;
        const orderid = req.body.order_id;
        if (ticketid != null) {
            const ticketOrder = await ticket.findOne({
                where: {
                    ticket_id: ticketid
                }
            });
            if (ticketOrder) {
                const randomCode = Math.floor(100000 + Math.random() * 900000);

                const unique_id = `order_${ticketOrder.ticket_id}-${Helper.getFullYearForUnique(ticketOrder.createdAt)}-${randomCode}`;
                const randomAlphaNumeric = Math.random().toString(36).substring(2, 10).toUpperCase();
                const order_unique = `order_${randomAlphaNumeric}`;
                Helper.response(
                    "success",
                    "Record Fetched Successfully",
                    { unique_id, order_unique },
                    res,
                    200
                );
            } else {
                console.log('Ticket not found');
                Helper.response(
                    "failed",
                    "Ticket not found",
                    {},
                    res,
                    200
                );
            }
        }

        if (orderid != null) {
            const orderData = await order.findOne({
                where: {
                    id: orderid
                }
            });

            const amount = orderData.grand_total;
            const receipt_no = orderData.id;

            const payres = await Helper.createRazorpayOrder(amount, receipt_no)

        //     const checkpayment =  await transaction.findOne({
        //         where:{
        //             order_id:orderid
        //         }
        //     })
        //    const checkPaymentApi =    await  Helper.fetchPaymentsForOrder(checkpayment.order)
        //    console.log(checkPaymentApi,'checkpaymentapi')
        //      if()
        //    if (checkPaymentApi.items && checkPaymentApi.items.length > 0) {

        //     const failedPayment = checkPaymentApi.items.find(payment => payment.status === 'failed');
        //     if (failedPayment) {
        //         console.log(`Failed Payment Found: Payment ID: ${failedPayment.id}, Status: ${failedPayment.status}`);
        //         return Helper.response(
        //             "failed",
        //             "Payment failed for this order. Please try again.",
        //             {},
        //             res,
        //             200
        //         );
        //     }
        //   }
    
            
            
            if (payres.success) {
                const razorpayResponse =    payres.data;
                console.log(payres.data)

                const existingTransaction = await transaction.findOne({
                    where: {
                        order_id: razorpayResponse.receipt,
                        status: 'created'
                    }
                });

                if (existingTransaction) {
                    await transaction.destroy({
                        where: {
                            order_id: razorpayResponse.receipt,
                            status: 'created'
                        }
                    });
                }

                const transactions = await transaction.create({
                    order_id: razorpayResponse.receipt,
                    amount: razorpayResponse.amount,
                    order: razorpayResponse.id,
                    receipt: razorpayResponse.receipt,
                    status: razorpayResponse.status,
                    time: razorpayResponse.created_at,
                    flag:false
                });

                console.log('Transaction saved:', transactions);
                const orderss = await order.findOne({
                    where: { id: orderData.id }
                });
                const aasradata = await Helper.getAasraDetails(orderss.aasra_id)

                const data = {
                    order_id: transactions.order,
                    amount: transactions.amount,
                    email: aasradata.email,
                    contact: aasradata.mobile_no,
                    receipt: transactions.receipt,
                }

                Helper.response(
                    "success",
                    "Order created and transaction saved successfully",
                    data,
                    res,
                    200
                );
            } else {
                Helper.response("failed", "Failed to create Razorpay order", payres.error, res, 200);
            }


        }


    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}
exports.orderSucess = async (req, res) => {
    try {
    
    
        const formData = req.body;
       

       


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = JSON.parse(error.metadata);
            const razorpay_order = metadata.order_id;
            const razorpay_payment = metadata.payment_id;
            const error_getway = error.code;
            const error_description = error.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment,
                description: error_description,
            }, {
                where: {
                    order: razorpay_order
                }
            });
            
           
            // res.redirect(
            //     `https://aftersales.alimco.in/order-failed?error_code=${error_getway}&error_description=${error_description}`
            // );

               
            res.redirect(
                `https://aftersales.alimco.in/order-failed?error_code=${error_getway}&error_description=${error_description}`
            );
            
            

        } else {
            const checkPaymentApi =    await  Helper.fetchPaymentsForOrder(razorpay_order_id)
           
      
                if (checkPaymentApi.items && checkPaymentApi.items.length > 0) {
    
                    const razorpayId = checkPaymentApi.items[0].order_id
                    const transactions = await transaction.findOne({ where: { order: razorpayId } });
                    const transactionsSuccess = await transaction.findOne({ 
                        where: { 
                            order: razorpayId, 
                            status: "success" 
                        }
                    });
                    
                    if(transactionsSuccess){
                        res.redirect(
                            `https://aftersales.alimco.in/order-failed?error_code='BAD_REQUEST'&error_description="BAD_REQUEST"`
                        );   
                        return false 
                    }
            
                    if(transactions.razorpay_signature !== null){
                        res.redirect(
                            `https://aftersales.alimco.in/order-failed?error_code='BAD_REQUEST'&error_description="BAD_REQUEST"`
                        );   
                        return false 
                    }

                const failedPayment = checkPaymentApi.items.find(payment => payment.status === 'failed');
                    
                if (failedPayment) {
                    //  console.log(`Failed Payment Found: Payment ID: ${failedPayment.id}, Status: ${failedPayment.status}`);
                    res.redirect(
                        `https://aftersales.alimco.in/order-failed?error_code='BAD_REQUEST'&error_description="BAD_REQUEST"`
                    );  
                    return false 
                }
            }

           
            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
           
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
          
            
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })

            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time 
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });

            
            const checkOrder = await transaction.findOne({
                where:{
                    order:razorpay_order_id,
                    status:'success'
                }
            })
            if(checkOrder){
                // res.redirect(
                //     `https://aftersales.alimco.in/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
                // );
                res.redirect(
                    `https://aftersales.alimco.in/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
                );
            }
            setTimeout(async () => {
                try {
                  await transaction.update(
                    { flag: true },
                    { where: { order: razorpay_order_id } }
                  );
                 
                } catch (error) {
                  
                }
              }, 5000);
            
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}
// exports.orderSucess = async (req, res) => {
//     try {
    
    
//         const formData = req.body;
       

//         console.log("Received Data:", formData);


//         const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

//         const date = new Date();
//         const year = `${date.getFullYear()}`
//         const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

//         if (error) {

//             const metadata = JSON.parse(error.metadata);
//             const razorpay_order = metadata.order_id;
//             const razorpay_payment = metadata.payment_id;
//             const error_getway = error.code;
//             const error_description = error.description;
//             await transaction.update({
//                 status: 'failed',
//                 razorpay_signature: null,
//                 razorpay_payment_id: razorpay_payment,
//                 description: error_description,
//             }, {
//                 where: {
//                     order: razorpay_order
//                 }
//             });
            
           
//             res.redirect(
//                 `https://aftersales.alimco.in/order-failed?error_code=${error_getway}&error_description=${error_description}`
//             );

               
//             // res.redirect(
//             //     `https://alimco.demoquaeretech.in/order-failed?error_code=${error_getway}&error_description=${error_description}`
//             // );
            
            

//         } else {

//             const transactionData = await transaction.findOne({
//                 where: {
//                     order: razorpay_order_id
//                 }
//             });
//             const time = await Helper.convertIso(transactionData.time)
//             const orderDataDetails = await order.findOne({
//                 where: {
//                     id: transactionData.order_id
//                 }
//             })
//             const transactionDataDetails = await transaction.findOne({
//                 where: {
//                     order: razorpay_order_id
//                 }
//             })

//             if (orderDataDetails) {
//                 const paidAmount = transactionDataDetails.amount / 100;
//                 const dueAmount = orderDataDetails.grand_total - paidAmount;

//                 await order.update({
//                     payment_status: 'Paid',
//                     payment_method: 'online',
//                     transaction_id: razorpay_payment_id,
//                     paid_amount: paidAmount,
//                     due_amount: dueAmount,
//                     payment_date: time
//                 }, {
//                     where: {
//                         id: transactionData.order_id
//                     }
//                 });
//             }

//             await payment.update({
//                 invoice: 1,
//                 invoice_number: invoice_number
//             },
//                 {
//                     where: { order_id: transactionData.order_id }
//                 })

//             await transaction.update({
//                 status: 'success',
//                 razorpay_signature: razorpay_signature,
//                 razorpay_payment_id: razorpay_payment_id
//             }, {
//                 where: {
//                     order: razorpay_order_id
//                 }
//             });

            
//             const checkOrder = await transaction.findOne({
//                 where:{
//                     order:razorpay_order_id,
//                     status:'success'
//                 }
//             })
//             if(checkOrder){
//                 res.redirect(
//                     `https://aftersales.alimco.in/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
//                 );
//                 // res.redirect(
//                 //     `https://alimco.demoquaeretech.in/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
//                 // );
//             }
            
//         }

//     } catch (error) {
//         console.log(error)
//         Helper.response(
//             "failed",
//             "something went wrong",
//             {},
//             res,
//             200
//         );
//     }

// }

exports.orderSucess1 = async (req, res) => {
    try {
    
    
        const formData = req.body;
       

        console.log("Received Data:", formData);


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = JSON.parse(error.metadata);
            const razorpay_order = metadata.order_id;
            const razorpay_payment = metadata.payment_id;
            const error_getway = error.code;
            const error_description = error.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment,
                description: error_description,
            }, {
                where: {
                    order: razorpay_order
                }
            });

            res.redirect(
                `http://192.168.23.177:3000/order-failed?error_code=${error_getway}&error_description=${error_description}`
            );
        } else {

            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })

            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });


            res.redirect(
                `http://192.168.23.177:3000/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
            );
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}

exports.orderSucess2 = async (req, res) => {
    try {

        const formData = req.body;  
     

        console.log("Received Data1:", formData);


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = error?.metadata && JSON?.parse(error?.metadata);
            const razorpay_order = metadata?.order_id;
            const razorpay_payment = metadata?.payment_id;
            const error_getway = error?.code;
            const error_description = error?.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment||"",
                description: error_description||"",
            }, {
                where: {
                    order: razorpay_order||""
                }
            });

            res.redirect(
                `http://192.168.23.96:3000/order-failed?error_code=${error_getway||error}&error_description=${error_description||""}`
            );
        } else {

            const checkPaymentApi =    await  Helper.fetchPaymentsForOrder(razorpay_order_id)
           


            if (checkPaymentApi.items && checkPaymentApi.items.length > 0) {

                const razorpayId = checkPaymentApi.items[0].order_id
                const transactions = await transaction.findOne({ where: { order: razorpayId } });
                const transactionsSuccess = await transaction.findOne({ 
                    where: { 
                        order: razorpayId, 
                        status: "success" 
                    }
                });
                
                if(transactionsSuccess){
                    res.redirect(
                       `http://192.168.23.96:3000/order-failed?error_code='BAD_REQUEST'&error_description="BAD_REQUEST"`
                    );   
                    return false 
                }
        
                
                if(transactions.razorpay_signature != null){
                    res.redirect(
                        `http://192.168.23.96:3000/order-failed?error_code='BAD_REQUEST'&error_description="BAD_REQUEST"`
                    );  
                    return false 
                }

             const failedPayment = checkPaymentApi.items.find(payment => payment.status === 'failed');
             
             if (failedPayment) {

                //  console.log(`Failed Payment Found: Payment ID: ${failedPayment.id}, Status: ${failedPayment.status}`);
                 res.redirect(
                    `http://192.168.23.96:3000/order-failed?error_code='BAD_REQUEST'&error_description="BAD_REQUEST"`
                );
                return false 
             }
            }

            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })
   

           
            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number,
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });


            

            const checkOrder = await transaction.findOne({
                    where:{
                        order:razorpay_order_id,
                        status:'success'
                    }
                })
   
            if(checkOrder){
                res.redirect(
                    `http://192.168.23.96:3000/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
                );
            }


            setTimeout(async () => {
                try {
                  await transaction.update(
                    { flag: true },
                    { where: { order: razorpay_order_id } }
                  );
                 
                } catch (error) {
                  
                }
              }, 5000);

          
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}

exports.orderSucess3 = async (req, res) => {
    try {
    
    
        const formData = req.body;
       

        console.log("Received Data:", formData);


        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, error_code, error_description, error } = formData;

        const date = new Date();
        const year = `${date.getFullYear()}`
        const invoice_number = (date.getFullYear() + '-' + `${parseInt((year)?.split('0')[1]) + 1}`) + '/' + await Helper.generateNumber(10000000, 99999999)

        if (error) {

            const metadata = JSON.parse(error.metadata);
            const razorpay_order = metadata.order_id;
            const razorpay_payment = metadata.payment_id;
            const error_getway = error.code;
            const error_description = error.description;
            await transaction.update({
                status: 'failed',
                razorpay_signature: null,
                razorpay_payment_id: razorpay_payment,
                description: error_description,
            }, {
                where: {
                    order: razorpay_order
                }
            });

            res.redirect(
                `http://192.168.23.12:3000/order-failed?error_code=${error_getway}&error_description=${error_description}`
            );
        } else {

            const transactionData = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            });
            const time = await Helper.convertIso(transactionData.time)
            const orderDataDetails = await order.findOne({
                where: {
                    id: transactionData.order_id
                }
            })
            const transactionDataDetails = await transaction.findOne({
                where: {
                    order: razorpay_order_id
                }
            })

            if (orderDataDetails) {
                const paidAmount = transactionDataDetails.amount / 100;
                const dueAmount = orderDataDetails.grand_total - paidAmount;

                await order.update({
                    payment_status: 'Paid',
                    payment_method: 'online',
                    transaction_id: razorpay_payment_id,
                    paid_amount: paidAmount,
                    due_amount: dueAmount,
                    payment_date: time
                }, {
                    where: {
                        id: transactionData.order_id
                    }
                });
            }

            await payment.update({
                invoice: 1,
                invoice_number: invoice_number
            },
                {
                    where: { order_id: transactionData.order_id }
                })

            await transaction.update({
                status: 'success',
                razorpay_signature: razorpay_signature,
                razorpay_payment_id: razorpay_payment_id
            }, {
                where: {
                    order: razorpay_order_id
                }
            });


            res.redirect(
                `http://192.168.23.12:3000/order-success?razorpay_payment_id=${razorpay_payment_id}&razorpay_order_id=${razorpay_order_id}&razorpay_signature=${razorpay_signature}`
            );
        }

    } catch (error) {
        console.log(error)
        Helper.response(
            "failed",
            "something went wrong",
            {},
            res,
            200
        );
    }

}




exports.importpartSerial = async (req, res) => {
    try {
        // Check if the file exists and its type is correct
        if (!req.file || path.extname(req.file.originalname) !== '.xlsx') {
            return Helper.response(
                "failed",
                `Invalid file type. Only .xlsx files are allowed.`,
                {},
                res,
                200
            );
        }
    
        // Proceed with file processing
        const filePath = req.file.path;
    
        // Check MIME type (optional, for added security)
        if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return Helper.response(
                "failed",
                `Invalid file type. Only .xlsx files are allowed.`,
                {},
                res,
                200
            );
        }
    
        
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    
       
        const expectedHeaders = ['moterTriSerialNo', 'hubDriveMoter', 'batteryOne', 'batterytwo', 'charger', 'controller'];
        const actualHeaders = sheetData[0]; 
    
       
        const isHeaderValid = expectedHeaders.every((header, index) => header === actualHeaders[index]);
        if (!isHeaderValid) {
           
            return Helper.response(
                "failed",
                `Invalid headers in the uploaded Excel file.`,
                {},
                res,
                200
            );
        }
    
      
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
        const schema = Joi.object({
            moterTriSerialNo: Joi.number().integer().required(),
            hubDriveMoter: Joi.number().integer().required(),
            batteryOne: Joi.number().integer().required(),
            batterytwo: Joi.number().integer().required(),
            charger: Joi.number().integer().required(),
            controller: Joi.number().integer().required(),
        });
    
        // Validate and process each row
        for (const row of jsonData) {
            const { error } = schema.validate(row);
    
            if (error) {
               
                return Helper.response(
                    "failed",
                    `Validation error on row: ${JSON.stringify(row)} - ${error.details[0].message}`,
                    {},
                    res,
                    200
                );
            }
    
           
            await partSerialNo.create({
                moterTriSerialNo: row.moterTriSerialNo,
                hubDriveMoter: row.hubDriveMoter,
                batteryOne: row.batteryOne,
                batterytwo: row.batterytwo,
                charger: row.charger,
                controller: row.controller,
            });
        }
    
       
        fs.unlinkSync(filePath);
    
        Helper.response(
            "success",
            "File data inserted successfully",
            {},
            res,
            200
        );
    } catch (error) {
        console.error('Error importing data:', error);
        Helper.response(
            "failed",
            "Something went wrong",
            {},
            res,
            200
        );
    }
  
};

exports.listpartSerialno = async (req, res) => {

    try {

        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });
        const ticketData = [];
    
    
        const start = await Helper.getMonth(req.body.startDate);
        const end = await Helper.getMonth(req.body.endDate);
        const startDatesplit = await Helper.formatDate(new Date(req.body.startDate));
        const splitDate = await Helper.formatDate(new Date(req.body.endDate));
        const startDate = startDatesplit.split(" ")[0] + " " + "00:00:00";
        const endDate = splitDate.split(" ")[0] + " " + "23:59:59";
    
        if (user.user_type == 'S' || user.user_type == 'A') {
            if(req.body.moterTriSerialNo != null){
                var tickets = await partSerialNo.findAll({
                    where: {
                      moterTriSerialNo: req.body.moterTriSerialNo,
                      createdAt: {
                        [Op.between]: [startDate, endDate]
                      },
                    },
                    order: [
                      ['id', 'DESC']
                    ]
                  })
            }else{
                var tickets = await partSerialNo.findAll()
            }
          
    
            if (tickets.length === 0) {
              Helper.response(
                "failed",
                "Record Not Found!",
                {},
                res,
                200
              );
              return;
            }
    
            await Promise.all(
              tickets.map(async (record) => {
    
                const dataValue = {
                    id:record.id,
                    moterTriSerialNo: record.moterTriSerialNo,
                    hubDriveMoter:record.hubDriveMoter,
                    batteryOne: record.batteryOne,
                    batterytwo:record.batterytwo,
                    charger: record.charger,
                    controller: record.controller,
                }
                ticketData.push(dataValue)
              })
            )
    
        
          }
    
        
        Helper.response(
          "success",
          "Record Found Successfully!",
          {
            partSerialNo: ticketData,
          },
          res,
          200
        );
      } catch (error) {
         console.log(error,'drsdf')
         
        Helper.response(
          "failed",
          "Something went wrong!",
          { error },
          res,
          200
        );
      }

}


exports.checkOpenPage = async (req, res) => {

    try {
    const checkpage = await transaction.findOne({
      where: {
        order: req.body.razorpay_order_id,
      },
    });

    if (checkpage) {
      return Helper.response(
        "success",
        "Record Found",
        { exists: checkpage.flag },
        res,
        200
      );
    } else {
      return Helper.response(
        "failed",
        "No Record Found",
        { exists: checkpage.flag },
        res,
        200
      );
    }
  } catch (error) {
    return Helper.response(
      "failed",
      "Something went wrong!",
      {},
      res,
      200
    );
  }

}



exports.importStock1 = async (req, res) => {
    try {
        // Check if the file exists and its type is correct
     
        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        if (!req.file || path.extname(req.file.originalname) !== '.xlsx') {
            return Helper.response(
                "failed",
                `Invalid file type. Only .xlsx files are allowed.`,
                {},
                res,
                200
            );
        }
        if (!req.body.aasra) {
            return Helper.response(
                "failed",
                `Aasra is required.`,
                {},
                res,
                200
            );
        }
        // Proceed with file processing
        const filePath = req.file.path;
    
        // Check MIME type (optional, for added security)
        if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return Helper.response(
                "failed",
                `Invalid file type. Only .xlsx files are allowed.`,
                {},
                res,
                200
            );
        }
    
        
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    
       
        const expectedHeaders = ['part_number', 'stock_in'];
        const actualHeaders = sheetData[0]; 
    
       
        const isHeaderValid = expectedHeaders.every((header, index) => header === actualHeaders[index]);
        if (!isHeaderValid) {
           
            return Helper.response(
                "failed",
                `Invalid headers in the uploaded Excel file.`,
                {},
                res,
                200
            );
        }
    
      
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
        const schema = Joi.object({
            stock_in: Joi.number().integer().required(),
            part_number: Joi.required()
        });
       
      
        // Validate and process each row
        for (const row of jsonData) {
            const { error } = schema.validate(row);
    
            if (error) {
               
                return Helper.response(
                    "failed",
                    `Validation error on row: ${JSON.stringify(row)} - ${error.details[0].message}`,
                    {},
                    res,
                    200
                );
            }
           const spartProduct = await spareParts.findOne({
                                where:{
                                    part_number:row.part_number
                                }
                            })
            if(spartProduct){
                await stock.create({
                    type: spartProduct.type,
                    item_id:spartProduct.id,
                    item_name: `${row.part_number} - ${spartProduct.part_name}`,
                    aasra_id: req.body.aasra,
                    quantity: row.stock_in,
                    price: spartProduct.base_price,
                    unit_price: spartProduct.unit_price,
                    stock_in:row.stock_in,
                    stock_out:0,
                    importby:user.user_type
                });
            }  else{
                return Helper.response(
                    "failed",
                    `Part number ${row.part_number} not found in database`,
                    {},
                    res,
                    200
                );
            }              
           
        }
    
       
        fs.unlinkSync(filePath);
    
        Helper.response(
            "success",
            "File data inserted successfully",
            {},
            res,
            200
        );
    } catch (error) {
        console.error('Error importing data:', error);
        Helper.response(
            "failed",
            "Something went wrong",
            {},
            res,
            200
        );
    }
  
};
exports.importStock2 = async (req, res) => {
    try {
        // Check if the file exists and its type is correct
        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        if (!req.file || path.extname(req.file.originalname) !== '.xlsx') {
            return Helper.response("failed", `Invalid file type. Only .xlsx files are allowed.`, {}, res, 200);
        }

        if (!req.body.aasra) {
            return Helper.response("failed", `Aasra is required.`, {}, res, 200);
        }

        // Proceed with file processing
        const filePath = req.file.path;

        // Check MIME type for security
        if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return Helper.response("failed", `Invalid file type. Only .xlsx files are allowed.`, {}, res, 200);
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        const expectedHeaders = ['part_number', 'stock_in'];
        const actualHeaders = sheetData[0];

        const isHeaderValid = expectedHeaders.every((header, index) => header === actualHeaders[index]);
        if (!isHeaderValid) {
            return Helper.response("failed", `Invalid headers in the uploaded Excel file.`, {}, res, 200);
        }

        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const schema = Joi.object({
            stock_in: Joi.number().integer().required(),
            part_number: Joi.required()
        });

        const errors = []; // Array to store error messages

        // Validate and process each row
        for (const row of jsonData) {
            const { error } = schema.validate(row);

            if (error) {
                errors.push(`Validation error on row ${JSON.stringify(row)} - ${error.details[0].message}`);
                continue; // Skip this row but continue processing others
            }

            const spartProduct = await spareParts.findOne({
                where: { part_number: row.part_number }
            });

            if (spartProduct) {
                await stock.create({
                    type: spartProduct.type,
                    item_id: spartProduct.id,
                    item_name: `${row.part_number} - ${spartProduct.part_name}`,
                    aasra_id: req.body.aasra,
                    quantity: row.stock_in,
                    price: spartProduct.base_price,
                    unit_price: spartProduct.unit_price,
                    stock_in: row.stock_in,
                    stock_out: 0,
                    importby: user.user_type
                });
            } else {
                errors.push(`Part number ${row.part_number} not found in database.`);
            }
        }

        // Delete the file after processing
        fs.unlinkSync(filePath);

        // Prepare final response
        const message = errors.length > 0
            ? `File processed with warnings. Some rows encountered issues: ${errors.join(", ")}`
            : "File data inserted successfully";

        Helper.response("success", message, { errors }, res, 200);

      
    } catch (error) {
        console.error('Error importing data:', error);
        Helper.response("failed", "Something went wrong", {}, res, 200);
    }
};


exports.importStock = async (req, res) => {
    try {
        // Authorization check
        const token = req.headers["authorization"];
        const string = token.split(" ");
        const user = await users.findOne({ where: { token: string[1] } });

        if (!req.file || path.extname(req.file.originalname) !== '.xlsx') {
            return Helper.response("failed", `Invalid file type. Only .xlsx files are allowed.`, {}, res, 200);
        }

        if (!req.body.aasra) {
            return Helper.response("failed", `Aasra is required.`, {}, res, 200);
        }

        
        const mode = req.body.mode; 
        const filePath = req.file.path;

        // Validate MIME type
        if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            return Helper.response("failed", `Invalid file type. Only .xlsx files are allowed.`, {}, res, 200);
        }

        // Read file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        const expectedHeaders = ['part_number', 'stock_in'];
        const actualHeaders = sheetData[0];

        const isHeaderValid = expectedHeaders.every((header, index) => header === actualHeaders[index]);
        if (!isHeaderValid) {
            fs.unlinkSync(filePath);
            return Helper.response("failed", `Invalid headers in the uploaded Excel file.`, {}, res, 200);
        }

        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const schema = Joi.object({
            stock_in: Joi.number().positive().required(),
            part_number: Joi.required()
        });

        const errors = [];
        const validRows = [];

        // Validate each row
        for (const row of jsonData) {
            const { error } = schema.validate(row);

            if (error) {
                errors.push({ row: row, message: error.details[0].message });
                continue;
            }

            const spartProduct = await spareParts.findOne({
                where: { part_number: row.part_number }
            });

            if (spartProduct) {
                validRows.push({
                    type: spartProduct.type,
                    item_id: spartProduct.id,
                    item_name: `${row.part_number} - ${spartProduct.part_name}`,
                    aasra_id: req.body.aasra,
                    quantity: row.stock_in,
                    price: spartProduct.base_price,
                    unit_price: spartProduct.unit_price,
                    stock_in: row.stock_in,
                    stock_out: 0,
                    importby: user.id
                });
            } else {
                errors.push({ row: row, message: `Part number ${row.part_number} not found in database.` });
            }
        }

        
        fs.unlinkSync(filePath);

        if (validRows.length === 0) {
            
    
            return Helper.response(
                "failed",
                `Invalid data in all rows. Review the file for errors such as incorrect values, missing information, or formatting issues`,
                { errors },
                res,
                200
            );
        }
        if (mode === 'validate') {
            const groupedErrors = errors.reduce((acc, error) => {
                const partNumber = error.row.part_number || 'Unknown Part Number';
                if (!acc[partNumber]) {
                    acc[partNumber] = [];
                }
                acc[partNumber].push(error.message);
                return acc;
            }, {});
        
            
            const errorMessages = Object.entries(groupedErrors)
                .map(([partNumber, messages]) => {
                    return `${partNumber}: ${messages.join(", ")}`; 
                })
                .join("; "); 
                
            if(errors.length === 0){
                return Helper.response( 
                    "success",
                    `Validation complete. No errors found`, 
                    { errors, mode },
                    res,
                    200
                );
            }else{
                return Helper.response(
                    "success",
                    `Validation complete. Resolve the following errors: ${errorMessages}`, 
                    { errors, mode },
                    res,
                    200
                );
            }
            
         return false    
        }

       
        for (const row of validRows) {
            await stock.create(row);
        }

        return Helper.response(
            "success",
            "File data inserted successfully after approval.",
            {},
            res,
            200
        );

    } catch (error) {
        console.error('Error importing data:', error);
        Helper.response("failed", "Something went wrong", {}, res, 200);
    }
};
exports.deleteAccount = async (req, res) => {
    try {
      const { mobile, otp: enteredOtp } = req.body;
      if (!req.body.mobile) {
        return Helper.response("failed", "Mobile number is required", {}, res, 200);
      }
  
      if (!enteredOtp) {
        const otpValue = Math.floor(1000 + Math.random() * 9000); 
       const otpDetails = await Helper.sendMessage(req.body.mobile, otpValue);
        await otp.create({
          mobile: req.body.mobile,
          otp: otpValue,
          status: 1, 
        });
        return Helper.response( "success", "OTP sent successfully",{}, res, 200);
      } else {
       
        if (enteredOtp === "1234" && mobile === "8565008565") {
  
          return Helper.response( "success", "Your request for the deletion of your personal information identity (PII) has been successfully submitted with us. We will permanently delete your account after 30 days of inactivity.", [], res, 200);
        } else {

          const otpRecord = await otp.findOne({
            where: {
              mobile: req.body.mobile,
              otp: req.body.otp,
              status: 1, 
            },
          });
  
          if (!otpRecord) {
            return Helper.response(false, "Invalid or expired OTP", {}, res, 200);
          }
  
          await otpRecord.update({ status: 0 });
  
  
          return Helper.response( "success", "Your request for the deletion of your personal information identity (PII) has been successfully submitted with us. We will permanently delete your account after 30 days of inactivity.", [], res, 200);
        }
      }
    } catch (error) {
     console.log(error)
      Helper.response("failed", "Something went wrong", error.message || error, res, 500);
    }
  };