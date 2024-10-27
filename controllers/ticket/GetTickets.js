const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const ticket = require("../../models/ticket");
const mgc = require("../../mgc/mgc");

async function GetTickets(req, res) {
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
        let ticketData = await mgc.findRecords(ticket, {}, ticket.find)
            .then((data) => {
                return data;
            });
        let studentData = await mgc.findRecords(student, {}, student.find)
            .then((data) => {
                return data;
            });

        let tickets = [];

        for (let i = 0; i < ticketData.length; i++) {
            for (let j = 0; j < studentData.length; j++) {
                if (ticketData[i].student === studentData[j].id) {

                    let ticket = {
                        id: ticketData[i].id,
                        student: ticketData[i].student,
                        createdDate: ticketData[i].createdDate,
                        createdTime: ticketData[i].createdTime,
                        text: ticketData[i].text,
                        firstName: studentData[j].firstName,
                        lastName: studentData[j].lastName,
                        email: studentData[j].email
                    };

                    tickets.push(ticket);
                }
            }
        }

        res.status(200).send({
            "status": 200,
            "message": "OK",
            "data": tickets
        });
    } else {
        res.status(400).send({
            "status": 400,
            "message": "Bad Request"
        });
    }
}

module.exports = GetTickets;