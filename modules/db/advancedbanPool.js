// === Libs ===
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// === Pool ===
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_ADVANCEDBAN,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
})

// === Exporting ===
module.exports = pool;