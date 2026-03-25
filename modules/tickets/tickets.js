// === Libs ===
const path = require('path');
const { createConstructor } = require("../vars/constructor");
const pool = require('../db/pool');
const {internalServerError} = require("../vars/error/errors");
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// === Main ===
async function createTicket(name, content) {
    try {
        const result = pool.query(
            'INSERT INTO `tickets` (name, content, finished, status) VALUES (?, ?, ?, ?)',
            [name, content, false, "in progress"]
        );
        if (result.affectedRows === 0) {
            return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Created ticket", undefined);
    } catch (err) {
        console.error(err);
        return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
    }
}

async function deleteTicket(id) {
    try {
        const result = pool.query(
            'DELETE FROM `tickets` WHERE id = ?',
            [id]
        );
        if (result.affectedRows === 0) {
            return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Deleted ticket", undefined);
    } catch (err) {
        console.error(err);
        return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
    }
}

async function updateStatus(id, status) {
    try {
        const result = pool.query(
            'UPDATE `tickets` SET status = ? WHERE id = ?',
            [status, id]
        );
        if (result.affectedRows === 0) {
            return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Updated ticket", undefined);
    } catch (err) {
        console.error(err);
        return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
    }
}

async function finish(id) {
    try {
        const result = pool.query(
            'UPDATE `tickets` SET finished = ? WHERE id = ?',
            [true, id]
        );
        if (result.affectedRows === 0) {
            return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Updated ticket", undefined);
    } catch (err) {
        console.error(err);
        return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
    }
}

async function get() {
    try {
        const [result] = await pool.query(
            'SELECT * FROM `tickets`'
        );
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Got tickets", result);
    } catch (err) {
        console.error(err);
        return createConstructor(process.env.ERROR_VAR, 500, "Internal server error", undefined);
    }
}

// === Exporting ===
module.exports = {
    createTicket,
    deleteTicket,
    updateStatus,
    finish,
    get
}