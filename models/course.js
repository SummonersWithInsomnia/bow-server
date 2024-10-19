const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true },
    program: { type: String, required: true },
    term: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    weekDay: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    campus: { type: String, required: true },
    deliveryMethod: { type: String, required: true },
    maxSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    deleted: { type: Boolean, request: true, default: false },
}, {
    collection: "courses"
});

module.exports = mongoose.model('Course', courseSchema);
