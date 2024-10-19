const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    type: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneCountryCode: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    birthday: { type: String, required: true },
    department: { type: String, required: true },
}, {
    collection: "admins"
});

module.exports = mongoose.model('Admin', adminSchema);