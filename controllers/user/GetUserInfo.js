const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");

async function GetUserInfo(req, res) {
    const auth = req.headers['authorization'];
    const token = auth && auth.split(' ')[1];

    if (token === undefined) {
        res.status(401).send({
            "status": 401,
            "message": "Unauthorized"
        });
        return;
    }

    let payload = jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            res.status(401).send({
                "status": 401,
                "message": "Unauthorized"
            });
            return;
        }
        return decoded;
    });

    if (payload === undefined) {
        return;
    }

    let userModel = payload.type.match("student") ? student : payload.type.match("admin") ? admin : null;

    if (userModel === null) {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
        return;
    }

    let userData = await mgc.findRecords(userModel, {id: payload.id}, userModel.findOne)
        .then((data) => {
            return data;
        });

    if (userData === null) {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
        return;
    }

    if (userData.type === "student") {
        res.status(200).send({
            "status": 200,
            "message": "OK",
            "userdata": {
                id: userData.id,
                type: userData.type,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                department: userData.department,
                program: userData.program
            }
        });
    } else if (userData.type === "admin") {
        res.status(200).send({
            "status": 200,
            "message": "OK",
            "userdata": {
                id: userData.id,
                type: userData.type,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                department: userData.department
            }
        });
    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
    }
}

module.exports = GetUserInfo;