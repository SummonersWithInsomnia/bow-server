const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const courseRegistration = require("../../models/courseRegistration");
const course = require("../../models/course");

async function GetMyCourses(req, res) {
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
        let myCourses = [];

        let myCourseRegistrations = await mgc.findRecords(courseRegistration, {student: userData.id, deleted: false}, courseRegistration.find)
            .then((data) => {
                return data;
            });

        if (myCourseRegistrations.length !== 0) {
            for (let i = 0; i < myCourseRegistrations.length; i++) {
                let courseData = await mgc.findRecords(course, {id: myCourseRegistrations[i].course, deleted: false}, course.findOne)
                    .then((data) => {
                        return data;
                    });

                let myCourse = {
                    "id": courseData.id,
                    "name": courseData.name,
                    "code": courseData.code,
                    "description": courseData.description,
                    "department": courseData.department,
                    "program": courseData.program,
                    "term": courseData.term,
                    "startDate": courseData.startDate,
                    "endDate": courseData.endDate,
                    "weekDay": courseData.weekDay,
                    "startTime": courseData.startTime,
                    "endTime": courseData.endTime,
                    "campus": courseData.campus,
                    "deliveryMethod": courseData.deliveryMethod,
                    "maxSeats": courseData.maxSeats,
                    "availableSeats": courseData.availableSeats,
                    "deleted": courseData.deleted,
                    "registrationId": myCourseRegistrations[i].id
                };

                myCourses.push(myCourse);
            }
        }

        res.status(200).send({
            "status": 200,
            "message": "OK",
            "data": myCourses
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

module.exports = GetMyCourses;