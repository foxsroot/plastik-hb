"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var sequelize_typescript_1 = require("sequelize-typescript");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var Achievement_1 = require("./models/Achievement");
var Analytic_1 = require("./models/Analytic");
var Banner_1 = require("./models/Banner");
var Button_1 = require("./models/Button");
var Content_1 = require("./models/Content");
var Heading_1 = require("./models/Heading");
var Page_1 = require("./models/Page");
var Paragraph_1 = require("./models/Paragraph");
var Product_1 = require("./models/Product");
var ProductImage_1 = require("./models/ProductImage");
var Session_1 = require("./models/Session");
var Shop_1 = require("./models/Shop");
var User_1 = require("./models/User");
dotenv_1.default.config();
var app = (0, express_1.default)();
var port = Number(process.env.PORT) || 5000;
// Enable CORS with credentials
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
var sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    models: [Achievement_1.Achievement, Analytic_1.Analytic, Banner_1.Banner, Button_1.Button, Content_1.Content, Heading_1.Heading, Page_1.Page, Paragraph_1.Paragraph, Product_1.Product, ProductImage_1.ProductImage, Session_1.Session, Shop_1.Shop, User_1.User],
});
// Test database connection
sequelize.authenticate()
    .then(function () { return console.log('Database connected successfully!'); })
    .catch(function (err) {
    console.error('Database connection failed. Please check the credentials and database server:', err);
    process.exit(1);
});
// API routes
app.get('/', function (req, res) {
    res.send('Backend is running!');
});
// ENDS HERE
// Error handling middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
app.listen(port, '0.0.0.0', function () {
    console.log("Server is running on http://".concat(process.env.DB_HOST, ":").concat(port));
    console.log("You can also access it at http://localhost:".concat(port));
});
