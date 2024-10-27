const express = require('express');
const app = express();

const mgc = require('./mgc/mgc');
mgc.connect();
mgc.initDatabase();

app.use(express.json());

// Cross-Origin Resource Sharing
const cors = require('cors');
const corsOptions = {
    origin: '*',
    methods: 'POST, GET, PUT, DELETE, PATCH',
    allowedHeaders: 'Content-Type, Authorization'
};
app.use(cors(corsOptions));

const router = require('./routes/router');
app.use(router);

app.listen(3999, () => console.log('Server started on port 3999'));