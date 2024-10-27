const student = require('../../models/student');
const mgc = require("../../mgc/mgc");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");

async function PostLoginStudent(req, res) {
    if (req.body.username !== undefined && req.body.password !== undefined) {
        let studentData = await mgc.findRecords(student,
            {username: req.body.username.toLowerCase()}, student.findOne)
            .then((data) => {
                return data;
            });

        if (studentData === null) {
            res.status(400).send({
                "status": 400,
                "message": "Username or Password is Incorrect"
            });
            return;
        }

        if (await bcrypt.compare(req.body.password, studentData.password)) {
            const payload = {
                id: studentData.id,
                username: studentData.username,
                type: studentData.type
            };
            const token = jwt.sign(payload, jwtSecret, {expiresIn: "1h"});
            res.status(200).send({
                "status": 200,
                "message": "OK",
                "userdata": {
                    type: studentData.type,
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

module.exports = PostLoginStudent;