const jwtSecret = require("../../jwtSecret");
const jwt = require("jsonwebtoken");
const admin = require("../../models/admin");
const student = require("../../models/student");
const mgc = require("../../mgc/mgc");

async function GetDashboard(req, res) {
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
            "message": "Bad Request 1"
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
            "message": "Bad Request 2"
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
                department: userData.department
            }
        });
    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request 3"
        });
    }
}

module.exports = GetDashboard;