const express = require('express');
const app = express();

app.use(express.json());

const router = require('./routes/router');
app.use(router);

app.listen(3000, () => console.log('Server started on port 3000'));