const mgc = require("../../mgc/mgc");
const student = require("../../models/student");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");

async function PostSignupStudent(req, res) {
    if (req.body.username !== undefined
    && req.body.password !== undefined
    && req.body.firstName !== undefined
    && req.body.lastName !== undefined
    && req.body.email !== undefined
    && req.body.phoneCountryCode !== undefined
    && req.body.phoneNumber !== undefined
    && req.body.birthday !== undefined
    && req.body.department !== undefined
    && req.body.program !== undefined) {
        if (!isValidUsername(req.body.username)) {
            res.status(400).send({
                "status": 400,
                "message": "Usernames can only contain lowercase English letters and numbers"
            });
            return;
        }

        if (!isValidPasswordLength(req.body.password)) {
            res.status(400).send({
                "status": 400,
                "message": "Password must be at least 8 characters long"
            });
            return;
        }

        if (!isValidName(req.body.firstName)) {
            res.status(400).send({
                "status": 400,
                "message": "First Name can only contain English letters and spaces"
            });
            return;
        }

        if (!isValidName(req.body.lastName)) {
            res.status(400).send({
                "status": 400,
                "message": "Last Name can only contain English letters and spaces"
            });
            return;
        }

        if (!isValidEmail(req.body.email)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Email Address"
            });
            return;
        }

        if (!isValidPhoneCountryCode(req.body.phoneCountryCode)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Phone Country Code"
            });
            return;
        }

        if (!isValidPhoneNumber(req.body.phoneNumber)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Phone Number"
            });
            return;
        }

        if (!isValidBirthdayForm(req.body.birthday)) {
            res.status(400).send({
                "status": 400,
                "message": "Invalid Birthday Format"
            });
            return;
        }

        if (!isValidBirthday(req.body.birthday)) {
            res.status(400).send({
                "status": 400,
                "message": "You must be at least 18 years old to sign up"
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

        let studentData = await mgc.findRecords(student,
            {username: req.body.username.toLowerCase()}, student.findOne)
            .then((data) => {return data;});

        if (studentData !== null) {
            res.status(400).send({
                "status": 400,
                "message": "The Username is Already Used"
            });
            return;
        }

        let newStudent = new student({
            id: Number(await mgc.countRecords(student).then((count) => {return count;})),
            type: "student",
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneCountryCode: Number(req.body.phoneCountryCode),
            phoneNumber: Number(req.body.phoneNumber),
            birthday: req.body.birthday,
            department: req.body.department,
            program: req.body.program
        });

        let createdStudent = await mgc.createRecord(student, newStudent)
            .then((data) => {return data;});

        console.log(createdStudent);

        if (createdStudent !== null) {
            const payload = {
                username: createdStudent.username,
                type: createdStudent.type
            };
            const token = jwt.sign(payload, jwtSecret, {expiresIn: "1h"});

            res.status(200).send({
                "status": 200,
                "message": "OK",
                "userdata": {
                    type: createdStudent.type,
                    token: token
                }
            });
        } else {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
        }
    } else {
        res.status(400).send({
            "status": 400,
            "message": "The Following Fields are Required: username, password, firstName, lastName, email, phoneCountryCode, phoneNumber, birthday, department, program"
        });
    }
}

function isValidUsername(username) {
    const regex = /^[a-z0-9]+$/;
    return regex.test(username);
}

function isValidPasswordLength(password) {
    return password.length >= 8;
}

function isValidName(name) {
    const regex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
    return regex.test(name);
}

function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function isValidPhoneCountryCode(phoneCountryCode) {
    return Number(phoneCountryCode) === 1;
}

function isValidPhoneNumber(phoneNumber) {
    if (Number(phoneNumber)) {
        const regex = /^[1-9][0-9]{9}$/;
        return regex.test(phoneNumber);
    } else {
        return false;
    }
}

function isValidBirthdayForm(birthday) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(birthday);
}

function isValidBirthday(birthday) {
    const date = new Date(birthday);
    const now = new Date();
    const minAgeDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    return date <= minAgeDate;
}

function isValidDepartment(department) {
    const departments = ["Software Development"];
    return departments.includes(department);
}

function isValidProgram(program) {
    const programs = ["Certificate (6 months)", "Post-Diploma (1 year)", "Diploma (2 years)"];
    return programs.includes(program);
}

module.exports = PostSignupStudent;