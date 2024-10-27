const admin = require('../../models/admin');
const mgc = require("../../mgc/mgc");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");

async function PostLoginAdmin(req, res) {
    if (req.body.username !== undefined && req.body.password !== undefined) {
        let adminData = await mgc.findRecords(admin,
            {username: req.body.username.toLowerCase()}, admin.findOne)
            .then((data) => {
                return data;
            });

        if (adminData === null) {
            res.status(400).send({
                "status": 400,
                "message": "Username or Password is Incorrect"
            });
            return;
        }

        if (await bcrypt.compare(req.body.password, adminData.password)) {
            const payload = {
                id: adminData.id,
                username: adminData.username,
                type: adminData.type
            };
            const token = jwt.sign(payload, jwtSecret, {expiresIn: "1h"});
            res.status(200).send({
                "status": 200,
                "message": "OK",
                "userdata": {
                    type: adminData.type,
                    token: token
                }
            });
        } else {
            res.status(400).send({
                "status": 400,
                "message": "Username or Password is Incorrect"
            });
        }

    } else {
        res.status(400).send({
            "status": 400,
            "message": "Username and Password are Required"
        });
    }
}

module.exports = PostLoginAdmin;