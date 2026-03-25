// === Libs ===
const pool = require('../db/pool');
const { createConstructor } = require("../vars/constructor");
const path = require('path');
require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

// === Main Functions ===

/**
 * Get comprehensive system insights and analytics
 * @returns {Promise<object>} Insights data with various statistics
 */
async function getInsights() {
    try {
        // Get all insights in parallel for performance
        const [
            staffActivity,
            moderationStats,
            playerStats,
            contentStats,
            recentActivity,
            actionBreakdown,
            topStaff,
            topActions
        ] = await Promise.all([
            getStaffActivityInsights(),
            getModerationInsights(),
            getPlayerInsights(),
            getContentInsights(),
            getRecentActivityInsights(),
            getActionBreakdownInsights(),
            getTopStaffInsights(),
            getTopActionsInsights()
        ]);

        const insights = {
            staffActivity,
            moderationStats,
            playerStats,
            contentStats,
            recentActivity,
            actionBreakdown,
            topStaff,
            topActions,
            generatedAt: new Date().toISOString()
        };

        return await createConstructor(
            process.env.SUCCESS_VAR,
            200,
            "Got insights successfully",
            insights
        );
    } catch (err) {
        console.error('Error fetching insights:', err);
        return await createConstructor(
            process.env.ERROR_VAR,
            500,
            "Failed to fetch insights",
            { error: err.message }
        );
    }
}

/**
 * Get staff activity statistics
 */
async function getStaffActivityInsights() {
    try {
        const [totalActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs'
        );

        const [uniqueStaff] = await pool.query(
            'SELECT COUNT(DISTINCT username) as count FROM logs'
        );

        const [todayActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE DATE(timestamp) = CURDATE()'
        );

        const [weekActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );

        const [monthActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
        );

        return {
            totalActions: totalActions[0]?.total || 0,
            uniqueStaff: uniqueStaff[0]?.count || 0,
            todayActions: todayActions[0]?.total || 0,
            weekActions: weekActions[0]?.total || 0,
            monthActions: monthActions[0]?.total || 0
        };
    } catch (err) {
        console.error('Error in getStaffActivityInsights:', err);
        return null;
    }
}

/**
 * Get moderation statistics
 */
async function getModerationInsights() {
    try {
        const [kicks] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%kick%"'
        );

        const [bans] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%ban%" AND action NOT LIKE "%tempban%"'
        );

        const [tempbans] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%tempban%"'
        );

        const [warns] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%warn%"'
        );

        const [todayModeration] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE DATE(timestamp) = CURDATE() AND (action LIKE "%kick%" OR action LIKE "%ban%" OR action LIKE "%warn%")'
        );

        const [recentModeration] = await pool.query(
            'SELECT username, action, target, timestamp FROM logs WHERE (action LIKE "%kick%" OR action LIKE "%ban%" OR action LIKE "%warn%") ORDER BY timestamp DESC LIMIT 5'
        );

        return {
            totalKicks: kicks[0]?.total || 0,
            totalBans: bans[0]?.total || 0,
            totalTempbans: tempbans[0]?.total || 0,
            totalWarns: warns[0]?.total || 0,
            todayTotal: todayModeration[0]?.total || 0,
            recentActions: recentModeration || []
        };
    } catch (err) {
        console.error('Error in getModerationInsights:', err);
        return null;
    }
}

/**
 * Get player-related statistics
 */
async function getPlayerInsights() {
    try {
        const [playerActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%player%"'
        );

        const [uniquePlayers] = await pool.query(
            'SELECT COUNT(DISTINCT target) as count FROM logs WHERE target IS NOT NULL AND target != ""'
        );

        const [topTargetedPlayers] = await pool.query(
            'SELECT target, COUNT(*) as count FROM logs WHERE target IS NOT NULL AND target != "" GROUP BY target ORDER BY count DESC LIMIT 10'
        );

        return {
            totalPlayerActions: playerActions[0]?.total || 0,
            uniquePlayersAffected: uniquePlayers[0]?.count || 0,
            topTargetedPlayers: topTargetedPlayers || []
        };
    } catch (err) {
        console.error('Error in getPlayerInsights:', err);
        return null;
    }
}

/**
 * Get content management statistics
 */
async function getContentInsights() {
    try {
        const [bugs] = await pool.query('SELECT COUNT(*) as total FROM bugs');
        const [reports] = await pool.query('SELECT COUNT(*) as total FROM reports');
        const [news] = await pool.query('SELECT COUNT(*) as total FROM information');
        const [suspections] = await pool.query('SELECT COUNT(*) as total FROM suspections');
        const [users] = await pool.query('SELECT COUNT(*) as total FROM users');
        const [roles] = await pool.query('SELECT COUNT(*) as total FROM roles');

        return {
            totalBugs: bugs[0]?.total || 0,
            totalReports: reports[0]?.total || 0,
            totalNews: news[0]?.total || 0,
            totalSuspections: suspections[0]?.total || 0,
            totalUsers: users[0]?.total || 0,
            totalRoles: roles[0]?.total || 0
        };
    } catch (err) {
        console.error('Error in getContentInsights:', err);
        return null;
    }
}

/**
 * Get recent activity timeline
 */
async function getRecentActivityInsights() {
    try {
        const [last24Hours] = await pool.query(
            `SELECT
                 DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
                COUNT(*) as count
             FROM logs
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
             GROUP BY hour
             ORDER BY hour DESC
                 LIMIT 24`
        );

        const [last7Days] = await pool.query(
            `SELECT
                 DATE_FORMAT(timestamp, '%Y-%m-%d') as day,
                COUNT(*) as count
             FROM logs
             WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY day
             ORDER BY day DESC`
        );

        return {
            last24Hours: last24Hours || [],
            last7Days: last7Days || []
        };
    } catch (err) {
        console.error('Error in getRecentActivityInsights:', err);
        return null;
    }
}


/**
 * Get action type breakdown
 */
async function getActionBreakdownInsights() {
    try {
        const [createActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%create%"'
        );

        const [deleteActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%delete%"'
        );

        const [editActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%edit%" OR action LIKE "%update%"'
        );

        const [viewActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%view%" OR action LIKE "%get%"'
        );

        const [moderationActions] = await pool.query(
            'SELECT COUNT(*) as total FROM logs WHERE action LIKE "%kick%" OR action LIKE "%ban%" OR action LIKE "%warn%"'
        );

        return {
            create: createActions[0]?.total || 0,
            delete: deleteActions[0]?.total || 0,
            edit: editActions[0]?.total || 0,
            view: viewActions[0]?.total || 0,
            moderation: moderationActions[0]?.total || 0
        };
    } catch (err) {
        console.error('Error in getActionBreakdownInsights:', err);
        return null;
    }
}

/**
 * Get top staff members by activity
 */
async function getTopStaffInsights() {
    try {
        const [topStaff] = await pool.query(
            `SELECT
                username,
                COUNT(*) as actionCount,
                MAX(timestamp) as lastActive
             FROM logs
             GROUP BY username
             ORDER BY actionCount DESC
             LIMIT 10`
        );

        return topStaff || [];
    } catch (err) {
        console.error('Error in getTopStaffInsights:', err);
        return [];
    }
}

/**
 * Get most common actions
 */
async function getTopActionsInsights() {
    try {
        const [topActions] = await pool.query(
            `SELECT
                action,
                COUNT(*) as count
             FROM logs
             GROUP BY action
             ORDER BY count DESC
             LIMIT 10`
        );

        return topActions || [];
    } catch (err) {
        console.error('Error in getTopActionsInsights:', err);
        return [];
    }
}

// === Exporting ===
module.exports = {
    getInsights
};
