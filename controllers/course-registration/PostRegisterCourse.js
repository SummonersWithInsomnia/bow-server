const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const course = require("../../models/course");
const courseRegistration = require("../../models/courseRegistration");

async function PostRegisterCourse(req, res) {
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

        let courseData = await mgc.findRecords(course, {id: Number(req.body.id), deleted: false}, course.findOne)
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

        if (userData.department !== courseData.department) {
            res.status(400).send({
                "status": 400,
                "message": "You cannot register this course because your department doesn't match the course"
            });
            return;
        }

        if (userData.program !== courseData.program) {
            res.status(400).send({
                "status": 400,
                "message": "You cannot register this course because your program doesn't match the course"
            });
            return;
        }

        if (courseData.availableSeats <= 0) {
            res.status(400).send({
                "status": 400,
                "message": "This course is full"
            });
            return;
        }

        let registrationTotalData = await mgc.findRecords(courseRegistration, {student: userData.id, deleted: false}, courseRegistration.find)
            .then((data) => {
                return data;
            });

        let maxCourses = 0;
        switch (userData.program) {
            case "Certificate (6 months)":
                maxCourses = 1;
                break;
            case "Post-Diploma (1 year)":
                maxCourses = 2;
                break;
            case "Diploma (2 years)":
                maxCourses = 3;
                break;
            default:
                break;
        }

        if (registrationTotalData.length >= maxCourses) {
            res.status(400).send({
                "status": 400,
                "message": "You have already registered the maximum number of courses"
            });
            return;
        }

        let registrationData = await mgc.findRecords(courseRegistration, {course: courseData.id, student: userData.id, deleted: false}, courseRegistration.findOne)
            .then((data) => {
                return data;
            });

        if (registrationData !== null) {
            res.status(400).send({
                "status": 400,
                "message": "You have already registered this course"
            });
            return;
        }

        let newRegistration = new courseRegistration({
            id: Number(await mgc.countRecords(courseRegistration).then((count) => {return count;})),
            course: courseData.id,
            student: userData.id,
            deleted: false
        });

        let createdRegistration = await mgc.createRecord(courseRegistration, newRegistration)
            .then((data) => {
                return data;
            });

        if (createdRegistration === null) {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
            return;
        }

        courseData.availableSeats--;
        let updatedCourseResult = await mgc.updateRecords(course, {id: courseData.id, deleted: false}, course.updateOne, courseData)
            .then((data) => {
                return data;
            });

        if (updatedCourseResult.acknowledged === false) {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
            return;
        }

        res.status(200).send({
            "status": 200,
            "message": "Course Registered Successfully"
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

module.exports = PostRegisterCourse;