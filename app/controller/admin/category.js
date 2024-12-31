const Helper = require('../../helper/helper')
const category = require('../../model/category')
const manufacturer = require('../../model/manufacturer')
const problem = require('../../model/problem')
const uom = require('../../model/uom')
const Joi = require('joi');
const CryptoJS = require("crypto-js");


exports.create = async (req, res) => {
    
    const schema = Joi.object({
        category_name: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),// Only letters, numbers, and spaces allowed
        category_description: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),// Only letters, numbers, and spaces allowed
        status: Joi.boolean().required() 
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
    const catExist =  await category.findOne({
        where:{
            category_name: req.body.category_name,
        }
    })

    if (catExist) {
        return Helper.response(
            "failed",
            "Record already exists!",
            {},
            res,
            200 
        );
    }
    const checkName = category.f
    const data = {
        category_name: req.body.category_name,
        description: req.body.category_description,
        status: req.body.status
    }

    const create = category.create(data);
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
}

exports.list = async (req, res) => {

    try {
        const categories = await category.findAll({
            where:{
                status
                :1
            }
        })
        const data = [];
        categories.map((record) => {
            const value = {
                id: record.id,
                category_name: record.category_name,
                category_description: record.description,
                status: record.status
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
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }

}

exports.update = async (req, res) => {

    const schema = Joi.object({
        id: Joi.required(), 
        category_name: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        category_description: Joi.string().pattern(/^[a-zA-Z0-9\s]+$/).required(),
        status: Joi.boolean().required() ,
       
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
        
        const a = CryptoJS.AES.decrypt(req.body.id, process.env.SECRET_KEY);
        const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
     
          const requestData = {
            id: b.id,
            key:b.key,
          };
     
        const key = requestData.key ;
       console.log(requestData)
        const update = await category.update({
            category_name: req.body.category_name,
            description: req.body.category_description,
            status: req.body.status
        }, {
            where: {
                id: requestData.id,
            }
        })
        Helper.response(
            "success",
            "Record Update Successfully",
            {key},
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
exports.destroy = async (req, res) => {
    try {
        const data = await category.destroy({
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

    exports.uomCreate = async (req, res) => {

        const schema = Joi.object({
            unit_of_measurement: Joi.string().min(1).max(100000).pattern(/^[a-zA-Z0-9\s]+$/).required(),// Only letters, numbers, and spaces allowed
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

        const uomExist =  await uom.findOne({
            where:{
                unit_of_measurement: req.body.unit_of_measurement
            }
        })
        if (uomExist) {
            return Helper.response(
                "failed",
                "Record already exists!",
                {},
                res,
                200 
            );
        }
    
        const checkName = uom.f
        const data = {
            unit_of_measurement: req.body.unit_of_measurement
        }

        const create = uom.create(data);
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
    }

exports.listUom = async (req, res) => {

    try {
        const uomListing = await uom.findAll()

        const data = [];
        uomListing.map((record) => {
            const value = {
                id:record.id,
                unit_of_measurement: record.unit_of_measurement,
                value:record.id,
                label: record.unit_of_measurement,
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
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }

}

exports.updateUom = async (req, res) => {
    const schema = Joi.object({
        id: Joi.required(),
        unit_of_measurement: Joi.string().min(1).max(10000000).pattern(/^[a-zA-Z0-9\s]+$/).required(),// Only letters, numbers, and spaces allowed
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

        const a = CryptoJS.AES.decrypt(req.body.id, process.env.SECRET_KEY);
        const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
     
          const requestData = {
            id: b.id,
            key:b.key,
          };
     
        const key = requestData.key ;
       
        const update = await uom.update({
            unit_of_measurement: req.body.unit_of_measurement

        }, {
            where: {
                id: requestData.id,
            }
        })

        if (update[0] === 0) {
            return Helper.response(
                "failed",
                "Record not found or no changes made",
                {},
                res,
                200
            );
        }

        Helper.response(
            "success",
            "Record Update Successfully",
            {key},
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

exports.problemCreate = async (req, res) => {
    const schema = Joi.object({
        problem_name: Joi.string().pattern(/^[a-zA-Z0-9\s()/\-]+$/).required(),// Only letters, numbers, and spaces allowed
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
    const checkName = problem.f
    const data = {
        problem_name: req.body.problem_name
    }

    const create = problem.create(data);
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
}

exports.updateProblem = async (req, res) => {
    const schema = Joi.object({
        id: Joi.required(), 
        problem_name: Joi.string().pattern(/^[a-zA-Z0-9\s()/\-]+$/).required(),// Only letters, numbers, and spaces allowed
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
        const a = CryptoJS.AES.decrypt( req.body.id, process.env.SECRET_KEY);
        const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
     
          const requestData = {
            id: b.id,
            key:b.key,
          };
     
        const key = requestData.key ;
       
        const update = await problem.update({
            problem_name: req.body.problem_name

        }, {
            where: {
                id: requestData.id,
            }
        })

        if (update[0] === 0) {
            return Helper.response(
                "failed",
                "Record not found or no changes made",
                {},
                res,
                200
            );
        }

        Helper.response(
            "success",
            "Record Update Successfully",
            {key},
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
exports.listProblem = async (req, res) => {

    try {
        const problemListing = await problem.findAll()

        const data = [];
        problemListing.map((record) => {
            const value = {
                id:record.id,
                problem_name: record.problem_name,
                value:record.id,
                label: record.problem_name,
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
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }

}


exports.manufacturerCreate = async (req, res) => {
    const schema = Joi.object({
        manufacturer_name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),// Only letters, numbers, and spaces allowed
        manufacturer_code: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
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
    const checkName = manufacturer.f
    const data = {
        manufacturer_name: req.body.manufacturer_name,
        manufacturer_code: req.body.manufacturer_code
    }

    const create = manufacturer.create(data);
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
}

exports.updateManufacturer = async (req, res) => {
    const schema = Joi.object({
        id: Joi.required(), 
        manufacturer_name: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),// Only letters, numbers, and spaces allowed
        manufacturer_code: Joi.string().pattern(/^[a-zA-Z0-9\s&\/\-,.\(\)'"]+$/).required(),
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

        const a = CryptoJS.AES.decrypt(req.body.id, process.env.SECRET_KEY);
        const b = JSON.parse(a.toString(CryptoJS.enc.Utf8));
     
          const requestData = {
            id: b.id,
            key:b.key,
          };
     
        const key = requestData.key ;
       
        const update = await manufacturer.update({
            manufacturer_name: req.body.manufacturer_name,
            manufacturer_code: req.body.manufacturer_code


        }, {
            where: {
                id: requestData.id,
            }
        })

        if (update[0] === 0) {
            return Helper.response(
                "failed",
                "Record not found or no changes made",
                {},
                res,
                200
            );
        }

        Helper.response(
            "success",
            "Record Update Successfully",
            {key},
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

exports.listManufacturer = async (req, res) => {

    try {
        const manufacturerListing = await manufacturer.findAll()

        const data = [];
        manufacturerListing.map((record) => {
            const value = {
                id:record.id,
                manufacturer_name: record.manufacturer_name,
                value:record.id,
                label: record.manufacturer_code,
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
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }

}