const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const course = require("../../models/course");
const courseRegistration = require("../../models/courseRegistration");

async function PostSearchStudentListByCourse(req, res) {
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
        if (req.body.id === undefined || isNaN(Number(req.body.id))) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        let courseData = await mgc.findRecords(course,
            {id: Number(req.body.id), deleted: false}, course.findOne)
            .then((data) => {
                return data;
            });

        if (courseData === null) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        let registrationData = await mgc.findRecords(courseRegistration,
            {deleted: false, course: Number(req.body.id)}, courseRegistration.find)
            .then((data) => {
                return data;
            });

        let studentData = [];

        for (let i = 0; i < registrationData.length; i++) {
            studentData.push(await mgc.findRecords(student,
                {id: registrationData[i].student}, student.findOne)
                .then((result) => {
                    return result;
                }));
        }

        for (let i = 0; i < studentData.length; i++) {
            delete studentData[i].password;
        }

        res.status(200).send({
            "status": 200,
            "message": "OK",
            "data": {
                course: courseData,
                students: studentData
            }
        });
    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
    }

}

module.exports = PostSearchStudentListByCourse;