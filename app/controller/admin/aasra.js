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
const { where } = require("sequelize");
const spareParts = require("../../model/spareParts");
const labour_charges = require('../../model/labour_charges')


exports.registerAasraCentre = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        const unique_code = `AC_${await Helper.generateNumber(10000, 99999)}`;
        const rootUploadDir = 'documents/';
        form.parse(req, async function (err, fields, files) {
            if (!files.photoImg || !files.panImg || !files.adhaarImg || !files.areaImgs || !files.marketImg || !files.salesImg || !files.regImg || !files.signatureImg) {
                return Helper.response("failed", "Upload all images", null, res, 200);
            }
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
                const createAasra = await aasra.create({
                    ...transformedFields,
                    unique_code: unique_code
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
                            user_type: 'AC',
                            email: createAasra.email,
                            password: Helper.encryptPassword(password),
                            pass_code: password,
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
            }]
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

                    const createAasra = await aasra.update(transformedFields, { where: { id: transformedFields.id } });


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
                                if (files[field] && files[field][0]) {
                                    await moveFile(files[field][0], folder, field);
                                } else {
                                    console.error(`No file found for field '${field}'.`);
                                }
                            }

                            const updateFields = { ...transformedFieldsFile, unique_code: unique_code };

                            const documentData = await document.update(
                                updateFields,
                                { where: { aasra_id: transformedFields.id } }
                            );
                            Helper.response("success", "User updated successfully", {}, res, 200);

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
                const createAasra = await aasra.update(transformedFields, { where: { id: transformedFields.id } });
                Helper.response("success", "User updated successfully", {}, res, 200);
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
                label: record.part_name
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


exports.productRepairList = async (req, res) => {
    try {
        const { repair_id } = req.body
        const product = await labour_charges.findAll({ where: { productId: repair_id } })
        const data = product.map((f) => {
            const productData = {
                value: f.slNo,
                label: f.natureOfWork,
                serviceCharge: f.labourCharges,
                repair_time: f.repairTime,
                price: 45,
                gst: 0.18
            }
            return productData
        })
        Helper.response("success", "Product Found Successfully!", data, res, 200);
    } catch (error) {
        Helper.response("failed", "Server error", error, res, 200);
    }
}