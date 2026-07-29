const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const v1Routes = require('./routes/v1');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/v1', v1Routes);

// Error Handling
app.use(errorHandler);

module.exports = app;
