// === Libs ===
const path = require("path");
const {createConstructor} = require("../vars/constructor");
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// === Main ===
async function getLivePlayers() {
    try {
        const response = await fetch(
            process.env.CONNECTOR_IP + ':' + process.env.CONNECTOR_PORT + '/api/get/players'
        )
        if (!response.ok) {
            return createConstructor("error", 500, "Internal Server Error", undefined);
        }

        const data = await response.json();
        return createConstructor(process.env.SUCCESS_VAR, 200, "Got live players", data);
    } catch (err) {
        console.error(err);
        return createConstructor("error", 500, "Internal Server Error", undefined);
    }
}

async function getPlayer(name) {
    try {
        const response = await fetch(
            process.env.CONNECTOR_IP + ':' + process.env.CONNECTOR_PORT + `/api/get/player/${name}`
        )
        if (!response.ok) {
            return createConstructor("error", 500, "Internal Server Error");
        }

        const data = await response.json();
        return createConstructor(process.env.SUCCESS_VAR, 200, "Got live players", data);
    } catch (err) {
        console.error(err);
        return createConstructor("error", 500, "Internal Server Error");
    }
}

async function sendPlayerToServer(name, server) {
    try {
        const response = await fetch(
            process.env.CONNECTOR_IP + ':' + process.env.CONNECTOR_PORT + `/api/post/sendPlayer/${name}`, {
                method: "POST",
                body: JSON.stringify({server: server})
            }
        );
        if (!response.ok) {
            return createConstructor("error", 500, "Internal Server Error");
        }

        return createConstructor(process.env.SUCCESS_VAR, 200, "Sent player", undefined);
    } catch (err) {
        console.error(err);
        return createConstructor("error", 500, "Internal Server Error");
    }
}

// === Exporting ===
module.exports = {
    getLivePlayers,
    getPlayer,
    sendPlayerToServer
}