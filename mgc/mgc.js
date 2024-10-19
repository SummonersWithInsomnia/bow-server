// Mongo Connection

import mongoose from "mongoose";
import {MONGODB_URL} from "../app.config";

export class mgc {
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
}