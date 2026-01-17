// === Libs ===
const pool = require('../db/pool');
const {createConstructor} = require("../vars/constructor");

// === Main ===
async function createRole(name, perms) {
    try {
        const permsJson = JSON.stringify(perms);

        const [result] = await pool.query(
            'INSERT INTO `roles` (name, perms) VALUES (?, ?)',
            [name, permsJson]
        );
        if (result.rowsAffected === 0) {
            return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Created role", undefined);
    } catch (err) {
        console.error(err);
        return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
    }
}

async function deleteRole(id) {
    try {
        const [result] = await pool.query(
            'DELETE FROM `roles` WHERE id = ?',
            [id]
        );
        if (result.rowsAffected === 0) {
            return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Deleted role", undefined);
    } catch (err) {
        console.error(err);
        return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
    }
}

async function getRoles() {
    try {
        const [result] = await pool.query(
            'SELECT * FROM `roles`'
        );
        if (result.rowsAffected === 0) {
            return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Got roles", result);
    } catch (err) {
        console.error(err);
        return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
    }
}

async function editRole(id, name, perms) {
    try {
        const permsJson = JSON.stringify(perms);
        const [result] = await pool.query(
            'UPDATE `roles` SET name = ?, perms = ? WHERE id = ?',
            [name, permsJson, id]
        );
        if (result.rowsAffected === 0) {
            return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        }
        return await createConstructor(process.env.SUCCESS_VAR, 200, "Edited role", undefined);
    } catch (err) {
        console.error(err);
        return await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
    }
}

// === Exporting ===
module.exports = {
    createRole,
    deleteRole,
    editRole,
    getRoles
}