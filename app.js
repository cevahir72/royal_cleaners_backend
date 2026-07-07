const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routers');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;
