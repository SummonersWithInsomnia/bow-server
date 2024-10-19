const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    student: { type: Number, required: true },
    createdDate: { type: String, required: true },
    createdTime: { type: String, required: true },
    text: { type: String, required: true },
}, {
    collection: 'tickets',
});

module.exports = mongoose.model('Ticket', ticketSchema);
