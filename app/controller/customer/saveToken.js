
const FirebaseToken = require("../../model/FirebaseToken");
const User = require("../../model/users")
const Helper = require("../../helper/helper");

exports.saveToken = async function (req, res, next) {
    try {
        const user_id = await Helper.getUserId(req)

        const { token } = req.body;

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(200).json({
                res: 'error',
                msg: 'User ID is not valid!',
            });
        }

        const firebaseToken = await FirebaseToken.findOne({
            where: {
                user_id: user_id
            }
        })

        if (firebaseToken) {
            const update = await FirebaseToken.update({
                user_id: user_id,
                token: token,
            }, {
                where: {
                    user_id: user_id,
                }
            })
            return res.status(200).json({
                res: 'success',
                msg: 'Token updated successfully!',
                data: firebaseToken,
                user: user,
            });

        } else {

            const data = {
                user_id: user_id,
                token: token
            }

            const create = FirebaseToken.create(data);

            return res.status(200).json({
                res: 'success',
                msg: 'Token saved successfully!',
                data: create,
            });
        }
    } catch (error) {
        console.error('Error in saveToken:', error);
        return res.status(200).json({
            res: 'error',
            msg: 'Something went wrong!',
        });
    }
};