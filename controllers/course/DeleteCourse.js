const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const courseRegistration = require("../../models/courseRegistration");
const course = require("../../models/course");

async function DeleteCourse(req, res) {
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

        let courseRegistrationData = await mgc.updateRecords(courseRegistration,
            {course: Number(req.body.id), deleted: false}, courseRegistration.updateMany, {deleted: true})
            .then((data) => {
                return data;
            });

        let courseData = await mgc.updateRecords(course,
            {id: Number(req.body.id), deleted: false}, course.updateOne, {deleted: true})
            .then((data) => {
                return data;
            });

        if (courseRegistrationData === null || courseData === null) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        res.status(200).send({
            "status": 200,
            "message": "Course Deleted"
        });
    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
    }
}

module.exports = DeleteCourse;