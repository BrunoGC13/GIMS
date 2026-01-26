// === Libs ===
const pool = require('../../db/pool');
const {internalServerError, unknownMsg} = require('../../vars/error/errors');
const {sentMessageSuccess, gotMessagesSuccess, deletedMSGSuccess} = require("../../vars/success/success");

// === Main ===
async function sendMessage(sender, content) {
    try {
        const [result] = await pool.query(
            'INSERT INTO `msg` (sender, content, date) VALUES (?, ?, ?)',
            [sender, content, new Date()]
        );
        if (result.affectedRows === 0) {
            return internalServerError;
        }

        return sentMessageSuccess;
    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

async function deleteMessage(id) {
    try {
        const [result] = await pool.query(
            'DELETE FROM `msg` WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return unknownMsg;
        }

        return deletedMSGSuccess;
    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

async function getMessages() {
    try {
        const [result] = await pool.query(
            'SELECT * FROM `msg`'
        );

        return result;
    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

// === Exporting ===
module.exports = {
    sendMessage,
    getMessages,
    deleteMessage
}