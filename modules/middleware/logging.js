// === Libs ===
const pool = require('../db/pool');
const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// === Main ===
/**
 * Logging middleware factory
 * @param {string} action - The action being performed (e.g., "create user", "delete bug")
 * @param {function} targetExtractor - Optional function to extract target/player from request
 * @returns {function} Express middleware function
 */
const logAction = (action, targetExtractor = null) => {
    return async (req, res, next) => {
        try {
            // Get user from authenticated token
            const username = req.user?.username || 'anonymous';

            // Extract target/player if extractor function provided
            let target = null;
            if (targetExtractor && typeof targetExtractor === 'function') {
                target = targetExtractor(req);
            }

            // Format timestamp
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

            // Build log message
            let logMessage;
            if (target) {
                logMessage = `[${timestamp}] ${username} executed ${action} for ${target}`;
            } else {
                logMessage = `[${timestamp}] ${username} executed ${action}`;
            }

            // Log to database
            await pool.query(
                'INSERT INTO logs (timestamp, username, action, target, message, endpoint) VALUES (NOW(), ?, ?, ?, ?, ?)',
                [username, action, target, logMessage, req.path]
            );

            // Log to console as well
            console.log(logMessage);

        } catch (err) {
            // Don't block request if logging fails, just log the error
            console.error('Logging error:', err);
        }

        // Continue to next middleware/handler
        next();
    };
};

/**
 * Simple logging middleware that logs all requests
 */
const logRequest = async (req, res, next) => {
    try {
        const username = req.user?.username || 'anonymous';
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const action = `${req.method} ${req.path}`;
        const logMessage = `[${timestamp}] ${username} executed ${action}`;

        await pool.query(
            'INSERT INTO logs (timestamp, username, action, message, endpoint) VALUES (NOW(), ?, ?, ?, ?)',
            [username, action, logMessage, req.path]
        );

        console.log(logMessage);
    } catch (err) {
        console.error('Logging error:', err);
    }

    next();
};

// === Exporting ===
module.exports = {
    logAction,
    logRequest
};
