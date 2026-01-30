const path = require("path");
const { Agent } = require("undici");
const { internalServerError } = require("../vars/error/errors");
const {createConstructor} = require("../vars/constructor");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

const allowedActions = [
    "start_server",
    "stop_server",
    "restart_server"
]

const dispatcher = new Agent({
    connect: {
        rejectUnauthorized: false
    }
});

// === Server management ===
async function serverAction(id, action) {
    if (!allowedActions.includes(action)) return createConstructor(process.env.ERROR_VAR, 400, "Not a valid action!", undefined);;
    try {
        const response = await fetch(
            `${process.env.CRAFTY_URL}/servers/${id}/action/${action}`,
            {
                dispatcher,
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.CRAFTY_TOKEN}`
                }
            }
        );
        if (!response.ok) return internalServerError;

        const data = await response.json();
        if (data.status !== "ok") return internalServerError;
        return createConstructor(process.env.SUCCESS_VAR, 200, "Sent server action successfully!", undefined);
    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

async function getLogs(id) {
    try {
        const response = await fetch(
            `${process.env.CRAFTY_URL}/servers/${id}/logs`,
            {
                dispatcher,
                headers: {
                    "Authorization": `Bearer ${process.env.CRAFTY_TOKEN}`
                }
            }
        );

        if (!response.ok) return internalServerError;

        const data = await response.json();
        if (data.status !== "ok") return internalServerError;

        return {
            raw: data.data
        };

    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

async function getServers() {
    try {
        const response = await fetch(
            `${process.env.CRAFTY_URL}/servers`,
            {
                dispatcher,
                headers: {
                    "Authorization": `Bearer ${process.env.CRAFTY_TOKEN}`
                }
            }
        );
        if (!response.ok) return internalServerError;

        const data = await response.json();
        if (data.status !== "ok") return internalServerError;

        return {
            raw: data.data
        };
    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

async function getProxyServers() {
    try {
        const response = await fetch(
            `${process.env.CONNECTOR_IP}:${process.env.CONNECTOR_PORT}/api/get/servers`,
            {
                dispatcher
            }
        );
        if (!response.ok) return internalServerError;

        const data = await response.json();
        return createConstructor(process.env.SUCCESS_VAR, 200, "Got servers", data);
    } catch (err) {
        console.error(err);
        return internalServerError;
    }
}

module.exports = {
    getLogs,
    getServers,
    getProxyServers,
    serverAction
};
