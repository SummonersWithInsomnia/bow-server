// Mongo Connection

const mongoose = require('mongoose');
const {MONGODB_URL, APP_MODE, ADMIN_ACCOUNTS} = require('../app.config');

const admin = require('../models/admin');
const course = require('../models/course');
const courseRegistration = require('../models/courseRegistration');
const student = require('../models/student');
const ticket = require('../models/ticket');
const bcrypt = require("bcrypt");

class mgc {
    constructor() {
        throw new Error("Cannot instantiate mgc class");
    }

    static async connect() {
        mongoose.connection.once("open", () => {
            console.log("Connected to MongoDB Server");
        });

        mongoose.connection.on("error", () => {
            console.error("Failed to connect to MongoDB Server");
        });

        mongoose.connection.on("disconnected", () => {
            console.error("Disconnected from MongoDB Server");
        });

        try {
            await mongoose.connect(MONGODB_URL);
        } catch (err) {
            console.error(err);
        }
    }

    static async countRecords(model, query) {
        try {
            return await model.countDocuments(query);
        } catch (err) {
            console.error(err);
        }
    }

    static async createRecord(model, data) {
        try {
            return await model.create(data);
        } catch (err) {
            console.error(err);
        }
    }

    static async deleteRecords(model, query, func) {
        try {
            return await func.call(model, query);
        } catch (err) {
            console.error(err);
        }
    }

    static async findRecords(model, query, func) {
        try {
            return await func.call(model, query);
        } catch (err) {
            console.error(err);
        }
    }

    static async updateRecords(model, query, func, data) {
        try {
            return await func.call(model, query, data);
        } catch (err) {
            console.error(err);
        }
    }

    static async initDatabase() {
        try {
            if (APP_MODE === 'Demo') {
                await this.deleteRecords(admin, {}, admin.deleteMany);
                await this.deleteRecords(course, {}, course.deleteMany);
                await this.deleteRecords(courseRegistration, {}, courseRegistration);
                await this.deleteRecords(student, {}, student.deleteMany);
                await this.deleteRecords(ticket, {}, ticket.deleteMany);

                for (let i = 0; i < ADMIN_ACCOUNTS.length; i++) {
                    let id = await this.countRecords(admin).then((count) => { return count; });

                    await this.createRecord(admin, {
                        id: id,
                        type: ADMIN_ACCOUNTS[i].type,
                        username: ADMIN_ACCOUNTS[i].username,
                        password: bcrypt.hashSync(ADMIN_ACCOUNTS[i].password, 10),
                        firstName: ADMIN_ACCOUNTS[i].firstName,
                        lastName: ADMIN_ACCOUNTS[i].lastName,
                        email: ADMIN_ACCOUNTS[i].email,
                        phoneCountryCode: ADMIN_ACCOUNTS[i].phoneCountryCode,
                        phoneNumber: ADMIN_ACCOUNTS[i].phoneNumber,
                        birthday: ADMIN_ACCOUNTS[i].birthday,
                        department: ADMIN_ACCOUNTS[i].department,
                    });
                }
                console.log("Initialized the database");
            }
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = mgc;