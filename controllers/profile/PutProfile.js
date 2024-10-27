const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");

async function PutProfile(req, res) {
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
            "message": "You must be at least 18 years old"
        });
        return;
    }

    userData.firstName = req.body.firstName;
    userData.lastName = req.body.lastName;
    userData.email = req.body.email;
    userData.phoneCountryCode = Number(req.body.phoneCountryCode);
    userData.phoneNumber = Number(req.body.phoneNumber);
    userData.birthday = req.body.birthday;

    let updatedUser = await mgc.updateRecords(userModel,{id: userData.id }, userModel.updateOne, userData)
        .then((data) => {
            return data;
        });

    if (updatedUser !== null) {
        res.status(200).send({
            "status": 200,
            "message": "Profile Updated"
        });
    } else {
        res.status(500).send({
            "status": 500,
            "message": "Internal Server Error"
        });
    }
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

module.exports = PutProfile;