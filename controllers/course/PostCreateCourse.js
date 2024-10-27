const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const course = require("../../models/course");

async function PostCreateCourse(req, res) {
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
        if (req.body.name === undefined || req.body.name.length === 0
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
        ) {
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

        if (req.body.maxSeats < 0) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Max Seats"
            });
            return;
        }

        let newCourse = new course({
            id: Number(await mgc.countRecords(course).then((count) => {return count;})),
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            department: req.body.department,
            program: req.body.program,
            term: req.body.term,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            weekDay: req.body.weekDay,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            campus: req.body.campus,
            deliveryMethod: req.body.deliveryMethod,
            maxSeats: Number(req.body.maxSeats),
            availableSeats: Number(req.body.maxSeats),
            deleted: false
        });

        let createdCourse = await mgc.createRecord(course, newCourse)
            .then((data) => {
                return data;
            });

        if (createdCourse === null) {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
            return;
        }

        res.status(200).send({
            "status": 200,
            "message": "Course Created Successfully"
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

module.exports = PostCreateCourse;