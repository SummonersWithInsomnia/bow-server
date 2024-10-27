const jwt = require("jsonwebtoken");
const jwtSecret = require("../../jwtSecret");
const student = require("../../models/student");
const admin = require("../../models/admin");
const mgc = require("../../mgc/mgc");
const ticket = require("../../models/ticket");

async function PostSendTicket(req, res) {
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
        if (req.body.text === undefined) {
            res.status(400).send({
                "status": 400,
                "message": "Bad Request"
            });
            return;
        }

        if (req.body.text.length < 20 || req.body.text.length > 140) {
            res.status(400).send({
                "status": 400,
                "message": "The message must be between 20 and 140 characters."
            });
            return;
        }

        let now = new Date();
        now.setHours(now.getHours() - 6);

        let createdTicket = await mgc.createRecord(ticket, {
            student: userData.id,
            createdDate: now.toISOString().substring(0, 10),
            createdTime: now.toISOString().substring(11, 19),
            text: req.body.text
        });

        if (createdTicket !== null) {
            res.status(200).send({
                "status": 200,
                "message": "Ticket is Sent Successfully"
            });
        } else {
            res.status(500).send({
                "status": 500,
                "message": "Internal Server Error"
            });
        }
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

module.exports = PostSendTicket;