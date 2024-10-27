const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");

async function PostSearchStudentList(req, res) {
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
        res.status(401).send({
            "status": 401,
            "message": "Unauthorized"
        });
    } else if (userData.type === "admin") {
        if (Object.keys(req.body).length === 0) {
            let studentData = await mgc.findRecords(student, {}, student.find)
                .then((data) => {
                    return data
                });

            for (let i = 0; i < studentData.length; i++) {
                delete studentData[i].password;
            }

            res.status(200).send({
                "status": 200,
                "message": "OK",
                "data": studentData
            });
            return;
        }

        let limitedFuzzyQueryItems = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        }

        let limitedAccurateQueryItems = {
            department: req.body.department,
            program: req.body.program
        }

        let safeFuzzyQueryItems = {};
        let safeAccurateQueryItems = {};


        for (let [key, value] of Object.entries(limitedFuzzyQueryItems)) {
            if (limitedFuzzyQueryItems[key] !== "" && limitedFuzzyQueryItems[key] !== undefined) {
                safeFuzzyQueryItems[key] = value;
            }
        }

        for (let [key, value] of Object.entries(limitedAccurateQueryItems)) {
            if (limitedAccurateQueryItems[key] !== "" && limitedAccurateQueryItems[key] !== undefined) {
                safeAccurateQueryItems[key] = value;
            }
        }

        let studentData = await mgc.findRecords(student, safeAccurateQueryItems, student.find)
            .then((data) => {
                return data
            });

        for (let i = 0; i < studentData.length; i++) {
            delete studentData[i].password;
        }

        let optimisedStudentData = [];

        for (let i = 0; i < studentData.length; i++) {
            for (let [key, value] of Object.entries(safeFuzzyQueryItems)) {
                if (studentData[i][key].toLowerCase().includes(value.toLowerCase())) {
                    if (!optimisedStudentData.some(item => item.id === studentData[i].id)) {
                        optimisedStudentData.push(studentData[i]);
                    }
                }
            }
        }

        if (optimisedStudentData.length === 0 && Object.keys(safeFuzzyQueryItems).length === 0) {
            optimisedStudentData = studentData;
        }

        res.status(200).send({
            "status": 200,
            "message": "OK",
            "data": optimisedStudentData
        });

    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
    }
}

module.exports = PostSearchStudentList;