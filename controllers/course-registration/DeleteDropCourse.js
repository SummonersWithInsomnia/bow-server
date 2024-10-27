const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const course = require("../../models/course");
const courseRegistration = require("../../models/courseRegistration");

async function DeleteDropCourse(req, res) {
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
        if (req.body.id === undefined || isNaN(Number(req.body.id))) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        let courseRegistrationData = await mgc.updateRecords(courseRegistration,
            {id: req.body.id, deleted: false}, courseRegistration.updateOne, {deleted: true})
            .then((data) => {
                return data;
            });

        if (courseRegistrationData === null) {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
            return;
        }

        let courseData = await mgc.findRecords(course, {id: courseRegistrationData.course}, course.findOne)
            .then((data) => {
                return data;
            });

        if (courseData === null) {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
            return;
        }

        courseData.availableSeats += 1;

        let updatedCourseData = await mgc.updateRecords(course, {id: courseData.id}, course.updateOne, courseData)
            .then((data) => {
                return data;
            });

        if (updatedCourseData === null) {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
            return;
        }

        res.status(200).send({
            "status": 200,
            "message": "Course Dropped Successfully"
        });
    } else if (userData.type === "admin") {
        res.status(401).send({
            "status": 401,
            "message": "Unauthorized"
        });
    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
    }
}

module.exports = DeleteDropCourse;