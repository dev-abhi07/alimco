const Helper = require('../../helper/helper')
const category = require('../../model/category')
const manufacturer = require('../../model/manufacturer')
const problem = require('../../model/problem')
const uom = require('../../model/uom')




exports.create = async (req, res) => {
    
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
        const categories = await category.findAll()
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
    try {
        const update = await category.update({
            category_name: req.body.category_name,
            description: req.body.category_description,
            status: req.body.status
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
    try {
        const update = await uom.update({
            unit_of_measurement: req.body.unit_of_measurement

        }, {
            where: {
                id: req.body.id,
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

exports.problemCreate = async (req, res) => {

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
    try {
        const update = await problem.update({
            problem_name: req.body.problem_name

        }, {
            where: {
                id: req.body.id,
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
    try {
        const update = await manufacturer.update({
            manufacturer_name: req.body.manufacturer_name,
            manufacturer_code: req.body.manufacturer_code


        }, {
            where: {
                id: req.body.id,
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