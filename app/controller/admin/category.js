const Helper = require('../../helper/helper')
const category = require('../../model/category')



exports.create = async (req, res) => {

    const checkName = category.f
    const data = {
        category_name: req.body.category_name,
        description: req.body.category_description,
        status:req.body.status
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
                id:record.id,
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
            status:req.body.status
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
exports.destroy = async (req,res) => {
    try {
        const data = await category.destroy({
            where:{
                id:req.body.id
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