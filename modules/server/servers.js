const path = require("path");
const { Agent } = require("undici");
const { internalServerError } = require("../vars/error/errors");
const {createConstructor} = require("../vars/constructor");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

const dispatcher = new Agent({
    connect: {
        rejectUnauthorized: false
    }
});

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
    getProxyServers
};
