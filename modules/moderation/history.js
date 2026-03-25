// === Libs ===
const path = require('path');
const { createConstructor } = require("../vars/constructor");
const pool = require('../db/advancedbanPool');
const {internalServerError} = require("../vars/error/errors");
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// === Main ===
async function getPlayerHistory(player) {
    try {
        const [result] = await pool.query(
            'SELECT * FROM `PunishmentHistory` WHERE name = ?',
            [player]
        );
        return createConstructor(process.env.SUCCESS_VAR, 200, "Got data", result);
    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

// === Exporting ===
module.exports = {
    getPlayerHistory
}