const mongoose = require('mongoose');

const courseRegistrationSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    student: { type: Number, required: true },
    course: { type: Number, required: true },
    deleted: { type: Boolean, request: true, default: false },
}, {
    collection: "courseRegistration"
});

module.exports = mongoose.model('CourseRegistration', courseRegistrationSchema);