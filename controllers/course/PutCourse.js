const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const course = require("../../models/course");
const courseRegistration = require("../../models/courseRegistration");

async function PutCourse(req, res) {
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
        if (req.body.id === undefined || isNaN(Number(req.body.id))
            || req.body.name === undefined || req.body.name.length === 0
            || req.body.code === undefined || req.body.code.length === 0
            || req.body.description === undefined || req.body.description.length === 0
            || req.body.department === undefined || req.body.department.length === 0
            || req.body.program === undefined || req.body.program.length === 0
            || req.body.term === undefined || req.body.term.length === 0
            || req.body.startDate === undefined || req.body.startDate.length === 0
            || req.body.endDate === undefined || req.body.endDate.length === 0
            || req.body.weekDay === undefined || req.body.weekDay.length === 0
            || req.body.startTime === undefined || req.body.startTime.length === 0
            || req.body.endTime === undefined || req.body.endTime.length === 0
            || req.body.campus === undefined || req.body.campus.length === 0
            || req.body.deliveryMethod === undefined || req.body.deliveryMethod.length === 0
            || req.body.maxSeats === undefined || isNaN(Number(req.body.maxSeats))
            || req.body.availableSeats === undefined || isNaN(Number(req.body.availableSeats))
            || req.body.deleted === undefined || !(req.body.deleted === false)
        ) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        let courseData = await mgc.findRecords(course, {id: Number(req.body.id)}, course.findOne)
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

        if (courseData.deleted === true) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        if (!isValidName(req.body.name)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Course Name"
            });
            return;
        }

        if (!isValidCourseCode(req.body.code)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Course Code"
            });
            return;
        }

        if (!isValidDepartment(req.body.department)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Department"
            });
            return;
        }

        if (!isValidProgram(req.body.program)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Program"
            });
            return;
        }

        if (!isValidTerm(req.body.term)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Term"
            });
            return;
        }

        if (!isValidDateForm(req.body.startDate) || !isValidDateForm(req.body.endDate)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Date Format"
            });
            return;
        }

        if (req.body.startDate > req.body.endDate) {
            res.status(400).send({
                "status": 400,
                "message": "Start Date cannot be later than End Date"
            });
            return;
        }

        if (!isValidWeekDay(req.body.weekDay)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Week Day"
            });
            return;
        }

        if (req.body.startTime > req.body.endTime) {
            res.status(400).send({
                "status": 400,
                "message": "Start Time cannot be later than End Time"
            });
            return;
        }

        if (req.body.maxSeats < req.body.availableSeats) {
            res.status(400).send({
                "status": 400,
                "message": "Available Seats cannot be more than Max Seats"
            });
            return;
        }

        if (req.body.maxSeats < 0) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Max Seats"
            });
            return;
        }

        let registrations = Number(await mgc.countRecords(courseRegistration,
            {course: Number(req.body.id), deleted: false}).then((data) => {return data;}));

        if (registrations !== req.body.maxSeats - req.body.availableSeats) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        courseData.name = req.body.name;
        courseData.code = req.body.code;
        courseData.description = req.body.description;
        courseData.department = req.body.department;
        courseData.program = req.body.program;
        courseData.term = req.body.term;
        courseData.startDate = req.body.startDate;
        courseData.endDate = req.body.endDate;
        courseData.weekDay = req.body.weekDay;
        courseData.startTime = req.body.startTime;
        courseData.endTime = req.body.endTime;
        courseData.campus = req.body.campus;
        courseData.deliveryMethod = req.body.deliveryMethod;
        courseData.maxSeats = Number(req.body.maxSeats);
        courseData.availableSeats = Number(req.body.availableSeats);

        let updatedCourseResult = await mgc.updateRecords(course,
            {id: Number(courseData.id), deleted: false}, course.updateOne, courseData)
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
            "message": "Course Updated Successfully"
        });
    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
    }
}

function isValidName(name) {
    const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
    return regex.test(name);
}

function isValidCourseCode(code) {
    const regex = /^([A-Z]+)([0-9]+)$/;
    return regex.test(code);
}

function isValidDepartment(department) {
    const departments = ["Software Development"];
    return departments.includes(department);
}

function isValidProgram(program) {
    const programs = ["Certificate (6 months)", "Post-Diploma (1 year)", "Diploma (2 years)"];
    return programs.includes(program);
}

function isValidTerm(term) {
    const terms = ["Fall", "Winter", "Spring", "Summer"];
    return terms.includes(term);
}

function isValidDateForm(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
}

function isValidWeekDay(weekDay) {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return weekDays.includes(weekDay);
}

module.exports = PutCourse;