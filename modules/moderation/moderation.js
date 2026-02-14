// === Libs ===
const axios = require('axios');
const path = require('path');
const { createConstructor } = require("../vars/constructor");
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// === Vars ===
// Validate environment variables
if (!process.env.CONNECTOR_IP || !process.env.CONNECTOR_PORT) {
    console.error('CRITICAL: CONNECTOR_IP and CONNECTOR_PORT must be set in .env file!');
    console.error('Current values:');
    console.error('  CONNECTOR_IP:', process.env.CONNECTOR_IP || '(not set)');
    console.error('  CONNECTOR_PORT:', process.env.CONNECTOR_PORT || '(not set)');
}

const CONNECTOR_URL = process.env.CONNECTOR_IP && process.env.CONNECTOR_PORT
    ? process.env.CONNECTOR_IP + ':' + process.env.CONNECTOR_PORT
    : null;

// === Helper Functions ===
/**
 * Makes a request to the moderation API
 * @param {string} action - The action endpoint (kick, ban, tempban, warn)
 * @param {object} data - The request data
 * @returns {Promise<object>} Response from the API
 */
async function makeActionRequest(action, data) {
    // Check if connector URL is configured
    if (!CONNECTOR_URL) {
        console.error('Moderation connector not configured!');
        return await createConstructor(
            process.env.ERROR_VAR,
            500,
            "Moderation connector not configured. Please set CONNECTOR_IP and CONNECTOR_PORT in .env file",
            {
                error: "Missing environment variables",
                required: ["CONNECTOR_IP", "CONNECTOR_PORT"],
                current: {
                    CONNECTOR_IP: process.env.CONNECTOR_IP || '(not set)',
                    CONNECTOR_PORT: process.env.CONNECTOR_PORT || '(not set)'
                }
            }
        );
    }

    try {
        const fullUrl = `${CONNECTOR_URL}/api/action/${action}`;
        console.log(`Making moderation request to: ${fullUrl}`);

        const response = await axios.post(fullUrl, data, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        return await createConstructor(
            process.env.SUCCESS_VAR,
            200,
            `Successfully executed ${action} on ${data.player}`,
            response.data
        );
    } catch (err) {
        console.error(`Moderation action error (${action}):`, err.response?.data || err.message);

        if (err.response) {
            // API responded with error
            return await createConstructor(
                process.env.ERROR_VAR,
                err.response.status,
                err.response.data.error || `Failed to ${action} player`,
                err.response.data
            );
        } else if (err.code === 'ECONNREFUSED') {
            // Connection refused - connector is down
            return await createConstructor(
                process.env.ERROR_VAR,
                503,
                "Moderation connector is unavailable",
                { error: "Cannot connect to moderation service" }
            );
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            // Request timeout
            return await createConstructor(
                process.env.ERROR_VAR,
                504,
                "Moderation request timed out",
                { error: "Request to moderation service timed out" }
            );
        } else {
            // Other error
            return await createConstructor(
                process.env.ERROR_VAR,
                500,
                "Internal server error during moderation action",
                { error: err.message }
            );
        }
    }
}

// === Main Functions ===
/**
 * Kicks a player from the server
 * @param {string} player - Player name (required)
 * @param {string|null} format - Format/category tag (optional)
 * @param {string|null} reason - Kick reason (optional)
 * @returns {Promise<object>} Response object
 */
async function kickPlayer(player, format = null, reason = null) {
    const data = { player };
    if (format) data.format = format;
    if (reason) data.reason = reason;

    return await makeActionRequest('kick', data);
}

/**
 * Permanently bans a player
 * @param {string} player - Player name (required)
 * @param {string|null} format - Format/category tag (optional)
 * @param {string|null} reason - Ban reason (optional)
 * @returns {Promise<object>} Response object
 */
async function banPlayer(player, format = null, reason = null) {
    const data = { player };
    if (format) data.format = format;
    if (reason) data.reason = reason;

    return await makeActionRequest('ban', data);
}

/**
 * Temporarily bans a player
 * @param {string} player - Player name (required)
 * @param {string} time - Ban duration (required, e.g., "2d", "1h", "30m")
 * @param {string|null} format - Format/category tag (optional)
 * @param {string|null} reason - Ban reason (optional)
 * @returns {Promise<object>} Response object
 */
async function tempbanPlayer(player, time, format = null, reason = null) {
    const data = { player, time };
    if (format) data.format = format;
    if (reason) data.reason = reason;

    return await makeActionRequest('tempban', data);
}

/**
 * Warns a player
 * @param {string} player - Player name (required)
 * @param {string|null} format - Format/category tag (optional)
 * @param {string|null} reason - Warning reason (optional)
 * @returns {Promise<object>} Response object
 */
async function warnPlayer(player, format = null, reason = null) {
    const data = { player };
    if (format) data.format = format;
    if (reason) data.reason = reason;

    return await makeActionRequest('warn', data);
}

// === Exporting ===
module.exports = {
    kickPlayer,
    banPlayer,
    tempbanPlayer,
    warnPlayer
};
