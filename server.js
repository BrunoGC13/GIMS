// === Libs ===
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyparser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');
const https = require('https');
const fs = require('fs');

const bugs = require('./modules/bugs/bugs');
const reports = require('./modules/reports/reports');
const server = require('./modules/server/servers');
const users = require('./modules/staff/users/users');
const groups = require('./modules/staff/groups/groups');
const login = require('./modules/staff/login');
const news = require('./modules/news/news');
const moderation = require('./modules/moderation/moderation');
const insights = require('./modules/insights/insights');
const tickets = require('./modules/tickets/tickets');

let {missingUserCreationVariables, internalServerError, missingUsernameErasementVariable, wrongPassword,
    missingBugCreationVariables, missingBugErasementVariables, missingReportCreationVariables, missingSendMSGVariables,
    missingDeleteMSGVariables, missingNewsCreationVariables, levelTooHigh, missingNewsDeletionVariables,
    unauthorizedAccess, missingNewsEditVariables, missingCreateSuspectionVariables, missingDeleteSuspectionsVariables,
    missingSuspectionEditVariables, missingKickPlayerVariables, missingBanPlayerVariables, missingTempbanPlayerVariables,
    missingWarnPlayerVariables
} = require("./modules/vars/error/errors");
const {gotUsersSuccess, loginSuccess, gotBugsSuccess, createdReportSuccess, gotReportsSuccess, gotMessagesSuccess,
    gotNewsSuccess, gotLogsSuccess, gotServersSuccess, createdSuspectionSuccess, gotSuspectionsSuccess
} = require("./modules/vars/success/success");
const {hashPassword, comparePasswords} = require("./modules/staff/hash");
const {signToken} = require('./modules/middleware/signToken');
const {authenticateToken} = require("./modules/middleware/authToken");
const {postBug} = require("./modules/bugs/bugs");
const {sendMessage, getMessages, deleteMessage} = require("./modules/staff/msg/msg");
const {getLogs, getServers, getProxyServers, serverAction} = require("./modules/server/servers");
const {createSuspection, getSuspections, editSuspection, deleteSuspection} = require("./modules/suspections/suspections");
const {createUser} = require("./modules/staff/users/users");
const {createConstructor} = require("./modules/vars/constructor");
const {createRole, deleteRole, editRole, getRoles} = require("./modules/staff/permissions");
const {checkPerms} = require("./modules/middleware/permissions");
const {logAction, logRequest} = require("./modules/middleware/logging");
const pool = require("./modules/db/pool");
const {getLivePlayers, getPlayer, sendPlayerToServer} = require("./modules/players/players");
const { body, param, validationResult } = require('express-validator');
const {getPlayerHistory} = require("./modules/moderation/history");

// === Vars ===
const app = express();
const port = process.env.PORT || 3000;

// === Static ===
app.use(bodyparser.json({ limit: '10kb' }));
app.use(cors());

// === Config ===
const { rateLimit } = require('express-rate-limit');
const helmet = require('helmet');

const options = {
    key: fs.readFileSync(path.join(__dirname, "local-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "local.pem"))
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8',
    message: 'Too many requests! Try again later',
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// === Endpoints ===
app.get('/api/test', (req, res) => {
    res.json({
        error: false,
        success: true,
        main: {
            msg: "Hello from the internal gamingblock services!",
            time: `${new Date()}`,
            endpoint: `${req.path}`
        }
    })
})

// === Users ===
app.post('/api/staff/users/create', limiter, authenticateToken, checkPerms("userCreation"), logAction("create user", req => req.body.username), async (req, res) => {
    const { username, password, permissions, ign } = req.body;

    if (!username || !password || !permissions || !ign) {
        missingUserCreationVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingUserCreationVariables);
    }

    try {
        const hashedPassword = await hashPassword(password);
        if (hashedPassword.error) {
            internalServerError.main['path'] = req.path;
            return res.status(500).json(internalServerError);
        }

        const result = await users.createUser(username, hashedPassword, permissions, ign);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);

    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
});

app.delete('/api/staff/users/delete', limiter, authenticateToken, checkPerms("userDeletion"), logAction("delete user", req => req.user.username), async (req, res) => {
    const { username } = req.user;
    if (!username) {
        missingUsernameErasementVariable.main['endpoint'] = req.path;
        return res.status(400).json(missingUsernameErasementVariable);
    }

    try {
        const result = await users.deleteUser(username);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);

    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
});

app.get('/api/staff/users/get', authenticateToken, checkPerms("userView"), async (req, res) => {
    try {
        const result = await users.getUsers();

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        gotUsersSuccess['data'] = result;
        gotUsersSuccess.main['endpoint'] = req.path;
        return res.json(gotUsersSuccess);

    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
});

app.get('/api/staff/users/get/:name', authenticateToken, checkPerms("userView"), async (req, res) => {
    const { name } = req.params;
    try {
        const result = await users.getUsers();
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }
        return res.json(await createConstructor(
            process.env.SUCCESS_VAR,
            200,
            "Got user",
            result.filter((e) => e.name === name)[0]
        ));
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

app.post('/api/staff/users/login', limiter, logAction("login", req => req.body.username), async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        missingUserCreationVariables.main['path'] = req.path;
        return res.status(400).json(missingUserCreationVariables);
    }

    try {
        const userList = await users.getUsers();
        const user = userList.find(e => e.name === username);

        if (!user) {
            return res.status(401).json(wrongPassword);
        }

        const result = await comparePasswords(password, user.password);

        if (!result.main.match) {
            return res.status(401).json(wrongPassword);
        }

        const accessToken = signToken(username);

        loginSuccess.main['path'] = req.path;
        loginSuccess.main['accessToken'] = (await accessToken).accessToken;

        return res.json(loginSuccess);

    } catch (err) {
        console.error(err);
        return res.status(500).json(internalServerError);
    }
});

// === Bugs ===
app.get('/api/bugs/get', async (req, res) => {
    try {
        const result = await bugs.getBugs();

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        gotBugsSuccess['data'] = result;
        gotBugsSuccess.main['endpoint'] = req.path;
        return res.json(gotBugsSuccess);

    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
});

app.post('/api/bugs/create', limiter, logAction("create bug", req => req.body.name), async (req, res) => {
    const { name, content } = req.body;
    if (!name || !content) {
        missingBugCreationVariables.main['path'] = req.path;
        return res.status(400).json(missingBugCreationVariables);
    }

    const result = await postBug(name,content);
    if (result.error) {
        internalServerError.main['path'] = req.path;
        return res.status(500).json(internalServerError);
    }

    result.main['endpoint'] = req.path;
    return res.json(result);
})

app.delete('/api/bugs/delete', limiter, authenticateToken, checkPerms("bugDeletion"), logAction("delete bug", req => req.body.name), async (req, res) => {
    const { name } = req.body;
    if (!name) {
        missingBugErasementVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingBugErasementVariables);
    }

    try {
        const result = await bugs.deleteBug(name);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);

    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
});

// === Reports ===
app.post('/api/reports/create', limiter, logAction("create report", req => req.body.player), async (req, res) => {
    const { player, content } = req.body;
    if (!player || !content) {
        missingReportCreationVariables.main['path'] = req.path;
        return res.status(400).json(missingReportCreationVariables);
    }

    try {
        const result = await reports.postReport(player, content);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        createdReportSuccess.main['endpoint'] = req.path;
        return res.json(createdReportSuccess);

    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
});

app.get('/api/reports/get', async (req, res) => {
    const result = await reports.getReports();
    if (result.error) {
        internalServerError.main['path'] = req.path;
        return res.status(500).json(internalServerError);
    }

    gotReportsSuccess['data'] = result;
    gotReportsSuccess.main['endpoint'] = req.path;
    return res.json(gotReportsSuccess);
})

app.delete('/api/reports/delete', limiter, authenticateToken, checkPerms("reportDeletion"), logAction("delete report", req => req.body.player), async (req, res) => {
    const { player } = req.body;
    if (!player) {
        missingReportCreationVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingReportCreationVariables);
    }

    try {
        const result = await reports.deletePost(player);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);

    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
});

// === Messages ===
app.post('/api/msg/send', limiter, authenticateToken, checkPerms("msgCreation"), logAction("send message"), async (req, res) => {
    const { username } = req.user;
    const { msg } = req.body;
    if (!username) {
        missingSendMSGVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingSendMSGVariables);
    }

    try {
        const result = await sendMessage(username, msg);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.delete('/api/msg/delete', limiter, authenticateToken, checkPerms("msgDeletion"), logAction("delete message", req => req.body.id), async (req, res) => {
    const { username } = req.user;
    const { id } = req.body;
    if (!username) {
        missingDeleteMSGVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingDeleteMSGVariables);
    }

    try {
        const result = await deleteMessage(id);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.get('/api/msg/get', authenticateToken, checkPerms("msgView"), async (req, res) => {
    try {
        const result = await getMessages();
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        gotMessagesSuccess.main['endpoint'] = req.path;
        gotMessagesSuccess['data'] = result;
        return res.json(gotMessagesSuccess);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

// === News ===
app.post('/api/news/write', limiter, authenticateToken, checkPerms("newsCreation"), logAction("create news", req => req.body.title), [body('title').isString().trim().isLength({ min: 1, max: 200 }).escape(), body('content').isString().trim().isLength({ min: 1, max: 5000 }).escape(), body('level').isInt({ min: 1, max: 5 })], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { username } = req.user;
    const { content, title, level } = req.body;
    if (!content || !title || !level) {
        missingNewsCreationVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingNewsCreationVariables);
    }
    if (level > 5) {
        levelTooHigh.main['endpoint'] = req.path;
        return res.status(400).json(levelTooHigh);
    }

    try {
        const result = await news.writeNews(username, title, content, level);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.put('/api/news/edit', limiter, authenticateToken, checkPerms("newsEdit"), logAction("edit news", req => req.body.title), async (req, res) => {
    const { username } = req.user;
    const { id, content, title, level } = req.body;
    if (!content || !title || !level) {
        missingNewsEditVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingNewsEditVariables);
    }
    if (level > 5) {
        levelTooHigh.main['endpoint'] = req.path;
        return res.status(400).json(levelTooHigh);
    }

    try {
        const result = await news.editNews(id, username, title, content, level);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.delete('/api/news/delete', limiter, authenticateToken, checkPerms("newsDeletion"), logAction("delete news", req => req.body.id), async (req, res) => {
    const { username } = req.user;
    const { id } = req.body;
    if (!id) {
        missingNewsDeletionVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingNewsDeletionVariables);
    }

    try {
        const result = await news.deleteNews(id, username);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.get('/api/news/get', async (req, res) => {
    try {
        const result = await news.getNews();
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        gotNewsSuccess.main['endpoint'] = req.path;
        gotNewsSuccess['data'] = result;
        return res.json(gotNewsSuccess);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

// === Servers ===
app.post('/api/servers/action/:action', limiter, authenticateToken, checkPerms('serverAction'), logAction("server action", req => `${req.params.action} on server ${req.body.id}`), async (req, res) => {
    const { action } = req.params;
    const { id } = req.body;
    if (!id || !action) {
        let constructor = createConstructor(process.env.ERROR_VAR, 400, "Please include the needed variables!", undefined);
        constructor.main['path'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await serverAction(id, action);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.get('/api/servers/logs/get/:id', authenticateToken, checkPerms("serverLogsView"), param('id').isInt(), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await getLogs(id);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        gotLogsSuccess.main['endpoint'] = req.path;
        gotLogsSuccess['data'] = result.raw;
        return res.json(gotLogsSuccess);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.get('/api/servers/get', authenticateToken, checkPerms("serverView"), async (req, res) => {
    try {
        const result = await getServers();
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        gotServersSuccess.main['endpoint'] = req.path;
        gotServersSuccess['data'] = result.raw;
        return res.json(gotServersSuccess);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.get('/api/servers/getProxy', authenticateToken, checkPerms("serverViewProxy"), async (req, res) => {
    try {
        const result = await getProxyServers();
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

// === Insights ===
app.get('/api/insights/get', authenticateToken, checkPerms("insightsView"), async (req, res) => {
    try {
        const result = await insights.getInsights();

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(result.status).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

// === Action Logs ===
app.get('/api/logs/get',  async (req, res) => {
    try {
        const [logs] = await pool.query(
            'SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100'
        );

        let constructor = await createConstructor(
            process.env.SUCCESS_VAR,
            200,
            "Got logs successfully",
            logs
        );
        constructor.main['endpoint'] = req.path;
        return res.json(constructor);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

// === Suspections ===
app.post('/api/suspections/create', limiter, authenticateToken, checkPerms("suspectionCreation"), logAction("create suspection", req => req.body.subject), async (req, res) => {
    const { title, description, subject } = req.body;
    if (!title || !description || !subject) {
        missingCreateSuspectionVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingCreateSuspectionVariables);
    }
    try {
        const result = await createSuspection(title, description, subject);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        createdSuspectionSuccess.main['endpoint'] = req.path;
        return res.json(createdSuspectionSuccess);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);

    }
})

app.delete('/api/suspections/delete', limiter, authenticateToken, checkPerms("suspectionDeletion"), logAction("delete suspection", req => req.body.id), async (req, res) => {
    const { id } = req.body;
    if (!id) {
        missingDeleteSuspectionsVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingDeleteSuspectionsVariables);
    }
    try {
        const result = await deleteSuspection(id);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.put('/api/suspections/edit', limiter, authenticateToken, checkPerms("suspectionEdit"), logAction("edit suspection", req => req.body.subject), async (req, res) => {
    const { id, title, description, subject } = req.body;
    if (!id || !title || !description || !subject) {
        missingSuspectionEditVariables.main['path'] = req.path;
        return res.status(500).json(missingSuspectionEditVariables);
    }
    try {
        const result = await editSuspection(id, title, description, subject);
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

app.get('/api/suspections/get', authenticateToken, checkPerms("suspectionView"), async (req, res) => {
    try {
        const result = await getSuspections();
        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(500).json(result);
        }

        gotSuspectionsSuccess.main['endpoint'] = req.path;
        gotSuspectionsSuccess['data'] = result;
        return res.json(gotSuspectionsSuccess);
    } catch (err) {
        console.error(err);
        internalServerError.main['endpoint'] = req.path;
        return res.status(500).json(internalServerError);
    }
})

// === Roles ===
app.post('/api/staff/roles/create', limiter, authenticateToken, checkPerms("roleCreation"), logAction("create role", req => req.body.name), async (req, res) => {
    const { name, perms } = req.body;
    if (!name || !perms) {
        let constructor = await createConstructor(process.env.ERROR_VAR, 400, "Please include the needed body variables for creating a role!", undefined);
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await createRole(name, perms);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.get('/api/roles/get', authenticateToken, checkPerms("roleView"), async (req, res) => {
    try {
        const result = await getRoles();
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.delete('/api/staff/roles/delete', limiter, authenticateToken, checkPerms("roleDeletion"), logAction("delete role", req => req.body.id), async (req, res) => {
    const { id } = req.body;
    if (!id) {
        let constructor = await createConstructor(process.env.ERROR_VAR, 400, "Please include the needed body variables for deleting a role!", undefined);
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await deleteRole(id);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.put('/api/staff/roles/edit', limiter, authenticateToken, checkPerms("roleEdit"), logAction("edit role", req => req.body.name), async (req, res) => {
    const { id, name, perms } = req.body;
    if (!id || !name || !perms) {
        let constructor = await createConstructor(process.env.ERROR_VAR, 400, "Please include the needed body variables for editing a role!", undefined);
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await editRole(id, name, perms)
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

// === Players ===
app.get('/api/players/live', authenticateToken, checkPerms("livePlayersView"), async (req, res) => {
    try {
        const result = await getLivePlayers();
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.get('/api/player/:name', authenticateToken, checkPerms("playerView"), async (req, res) => {
    const { name } = req.params;
    let constructor = createConstructor(
        process.env.SUCCESS_VAR,
        400,
        "Please include the needed variables!",
        undefined
    );
    constructor.main['endpoint'] = req.path;
    return res.status(constructor.status).json(constructor);
    try {
        const result = await getPlayer(name);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.post('/api/player/send/:name', limiter, authenticateToken, checkPerms("playerSending"), logAction("send player", req => `${req.params.name} to ${req.body.server}`), async (req, res) => {
    const { name } = req.params;
    const { server } = req.body;
    if (!name || !server) {
        let constructor = createConstructor(
            process.env.SUCCESS_VAR,
            400,
            "Please include the needed variables!",
            undefined
        );
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await sendPlayerToServer(name, server);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

// === Moderation ===
app.post('/api/moderation/kick', limiter, authenticateToken, checkPerms("playerKick"), logAction("kick player", req => req.body.player), async (req, res) => {
    const { player, format, reason } = req.body;

    if (!player) {
        missingKickPlayerVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingKickPlayerVariables);
    }

    try {
        const result = await moderation.kickPlayer(player, format, reason);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(result.status).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

app.post('/api/moderation/ban', limiter, authenticateToken, checkPerms("playerBan"), logAction("ban player", req => req.body.player), async (req, res) => {
    const { player, format, reason } = req.body;

    if (!player) {
        missingBanPlayerVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingBanPlayerVariables);
    }

    try {
        const result = await moderation.banPlayer(player, format, reason);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(result.status).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

app.post('/api/moderation/tempban', limiter, authenticateToken, checkPerms("playerTempban"), logAction("tempban player", req => `${req.body.player} for ${req.body.time}`), async (req, res) => {
    const { player, time, format, reason } = req.body;

    if (!player || !time) {
        missingTempbanPlayerVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingTempbanPlayerVariables);
    }

    try {
        const result = await moderation.tempbanPlayer(player, time, format, reason);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(result.status).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

app.post('/api/moderation/warn', limiter, authenticateToken, checkPerms("playerWarn"), logAction("warn player", req => req.body.player), async (req, res) => {
    const { player, format, reason } = req.body;

    if (!player) {
        missingWarnPlayerVariables.main['endpoint'] = req.path;
        return res.status(400).json(missingWarnPlayerVariables);
    }

    try {
        const result = await moderation.warnPlayer(player, format, reason);

        if (result.error === true) {
            result.main['endpoint'] = req.path;
            return res.status(result.status).json(result);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
});

app.get('/api/moderation/getPlayerHistory/:name', authenticateToken, checkPerms("playerHistoryView"), async (req, res) => {
    const { name } = req.params;
    if (!name) {
        let constructor = createConstructor(
            process.env.SUCCESS_VAR,
            400,
            "Please include the needed variables!",
            undefined
        );
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await getPlayerHistory(name);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }

        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.get('/api/moderation/getPlayer/:name', async (req, res) => {
    const { name } = req.params;
    if (!name) {
        let constructor = await createConstructor(
            process.env.SUCCESS_VAR,
            400,
            "Please include the needed variables!",
            undefined
        );
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    const history = await getPlayerHistory(name);
    if (history.error) {
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
    const player = await getPlayer(name);
    if (player.error) {
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }

    let tempData = {playerHistory: history.data, playerData: player.data};

    let constructor = await createConstructor(process.env.SUCCESS_VAR, 200, "Got player data", tempData);
    constructor.main['endpoint'] = req.path;
    return res.json(constructor);
});

// === Tickets ===
app.post('/api/tickets/create',limiter,  async (req, res) => {
    const { name, content } = req.body;
    if (!name || !content) {
        let constructor = await createConstructor(
            process.env.SUCCESS_VAR,
            400,
            "Please include the needed variables!",
            undefined
        );
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await tickets.createTicket(name, content);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.delete('/api/tickets/delete',limiter,  async (req, res) => {
    const { id } = req.body;
    if (!id) {
        let constructor = await createConstructor(
            process.env.SUCCESS_VAR,
            400,
            "Please include the needed variables!",
            undefined
        );
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await tickets.deleteTicket(id);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.put('/api/tickets/updateStatus',limiter,  async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
        let constructor = await createConstructor(
            process.env.SUCCESS_VAR,
            400,
            "Please include the needed variables!",
            undefined
        );
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await tickets.updateStatus(id, status);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.put('/api/tickets/finish',limiter,  async (req, res) => {
    const { id } = req.body;
    if (!id) {
        let constructor = await createConstructor(
            process.env.SUCCESS_VAR,
            400,
            "Please include the needed variables!",
            undefined
        );
        constructor.main['endpoint'] = req.path;
        return res.status(constructor.status).json(constructor);
    }
    try {
        const result = await tickets.finish(id);
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.get('/api/tickets/get', async (req, res) => {
    try {
        const result = await tickets.get();
        if (result.error) {
            let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
            internalServerError.main['endpoint'] = req.path;
            return res.status(internalServerError.status).json(internalServerError);
        }
        result.main['endpoint'] = req.path;
        return res.json(result);
    } catch (err) {
        console.error(err);
        let internalServerError = await createConstructor(process.env.ERROR_VAR, 500, "Internal Server Error", undefined);
        internalServerError.main['endpoint'] = req.path;
        return res.status(internalServerError.status).json(internalServerError);
    }
})

app.use(express.static(path.join(__dirname, 'public/staff/dist')));
app.use('/support', express.static(path.join(__dirname, 'public/support')));

// === Start ===
const httpsServer = https.createServer(options, app);
httpsServer.listen(port, () => {
    console.log(`GamingBlock internal management server started successfully!`);
    console.log(`Open on: https://localhost:${port}`);
})