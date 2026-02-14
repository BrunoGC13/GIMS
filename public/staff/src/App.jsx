import React, { useState, useEffect } from 'react';
import {
    Home, Users, Bug, AlertTriangle, MessageSquare,
    Newspaper, Server, Shield, Menu, X, Plus, Edit,
    Trash2, Eye, LogOut, Search, ChevronRight, Gamepad2, ScrollText
} from 'lucide-react';

const API_BASE = '/api';

export default function GamingBlockDashboard() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);

    // Data states
    const [users, setUsers] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [reports, setReports] = useState([]);
    const [messages, setMessages] = useState([]);
    const [news, setNews] = useState([]);
    const [servers, setServers] = useState([]);
    const [suspections, setSuspections] = useState([]);
    const [roles, setRoles] = useState([]);
    const [livePlayers, setLivePlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [playerSearch, setPlayerSearch] = useState('');
    const [proxyServers, setProxyServers] = useState([]);
    const [selectedChatUser, setSelectedChatUser] = useState(null);
    const [selectedServer, setSelectedServer] = useState(null);
    const [serverLogs, setServerLogs] = useState([]);
    const [actionLogs, setActionLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [logSearch, setLogSearch] = useState('');
    const [logFilter, setLogFilter] = useState('all'); // 'all', 'user', 'bug', 'player', 'moderation', etc.

    // Form states
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [newBug, setNewBug] = useState({ name: '', content: '' });
    const [newReport, setNewReport] = useState({ player: '', content: '' });
    const [newMessage, setNewMessage] = useState({ msg: '' });
    const [newNews, setNewNews] = useState({ title: '', content: '', level: 1 });
    const [newSuspection, setNewSuspection] = useState({ title: '', description: '', subject: '' });
    const [newUser, setNewUser] = useState({ username: '', password: '', permissions: '', ign: '' });
    const [newRole, setNewRole] = useState({ name: '', perms: [] });
    const [selectedPerms, setSelectedPerms] = useState([]);

    // Edit states
    const [editingNews, setEditingNews] = useState(null);
    const [editingReport, setEditingReport] = useState(null);
    const [editingSuspection, setEditingSuspection] = useState(null);
    const [editingRole, setEditingRole] = useState(null);

    // Moderation states
    const [showModerationDialog, setShowModerationDialog] = useState(null); // 'kick', 'ban', 'tempban', 'warn', or null
    const [moderationForm, setModerationForm] = useState({ format: '', reason: '', time: '' });

    const fetchWithAuth = async (endpoint, options = {}) => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
        });
        return response.json();
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/staff/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(loginForm),
            });
            const data = await response.json();
            if (data.main?.accessToken) {
                setToken(data.main.accessToken);
                localStorage.setItem('token', data.main.accessToken);
            }
        } catch (err) {
            console.error('Login failed:', err);
        }
        setLoading(false);
    };

    const loadData = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [usersRes, bugsRes, reportsRes, messagesRes, newsRes, serversRes, suspectionsRes, rolesRes, playersRes, proxyServersRes, logsRes] = await Promise.all([
                fetchWithAuth('/staff/users/get').catch(() => ({ data: [] })),
                fetchWithAuth('/bugs/get').catch(() => ({ data: [] })),
                fetchWithAuth('/reports/get').catch(() => ({ data: [] })),
                fetchWithAuth('/msg/get').catch(() => ({ data: [] })),
                fetchWithAuth('/news/get').catch(() => ({ data: [] })),
                fetchWithAuth('/servers/get').catch(() => ({ data: [] })),
                fetchWithAuth('/suspections/get').catch(() => ({ data: [] })),
                fetchWithAuth('/roles/get').catch(() => ({ data: [] })),
                fetchWithAuth('/players/live').catch(() => ({ data: { players: [], count: 0 } })),
                fetchWithAuth('/servers/getProxy').catch(() => ({ data: { servers: [], count: 0 } })),
                fetchWithAuth('/logs/get').catch(() => ({ data: [] })),
            ]);

            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setBugs(Array.isArray(bugsRes.data) ? bugsRes.data : []);
            setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
            setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
            setNews(Array.isArray(newsRes.data) ? newsRes.data : []);
            setServers(Array.isArray(serversRes.data) ? serversRes.data : []);
            setSuspections(Array.isArray(suspectionsRes.data) ? suspectionsRes.data : []);
            setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
            setLivePlayers(playersRes.data?.players || []);
            setProxyServers(proxyServersRes.data?.servers || []);
            setActionLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
        } catch (err) {
            console.error('Failed to load data:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token) loadData();
    }, [token]);

    // Auto-refresh data every 10 seconds
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(() => {
            loadData();
        }, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [token]);

    const createBug = async () => {
        await fetchWithAuth('/bugs/create', {
            method: 'POST',
            body: JSON.stringify(newBug),
        });
        setNewBug({ name: '', content: '' });
        loadData();
    };

    const deleteBug = async (name) => {
        await fetchWithAuth('/bugs/delete', {
            method: 'DELETE',
            body: JSON.stringify({ name }),
        });
        loadData();
    };

    const createReport = async () => {
        await fetchWithAuth('/reports/create', {
            method: 'POST',
            body: JSON.stringify(newReport),
        });
        setNewReport({ player: '', content: '' });
        loadData();
    };

    const sendMessage = async () => {
        await fetchWithAuth('/msg/send', {
            method: 'POST',
            body: JSON.stringify(newMessage),
        });
        setNewMessage({ msg: '' });
        loadData();
    };

    const createNews = async () => {
        await fetchWithAuth('/news/write', {
            method: 'POST',
            body: JSON.stringify(newNews),
        });
        setNewNews({ title: '', content: '', level: 1 });
        loadData();
    };

    const createSuspection = async () => {
        await fetchWithAuth('/suspections/create', {
            method: 'POST',
            body: JSON.stringify(newSuspection),
        });
        setNewSuspection({ title: '', description: '', subject: '' });
        loadData();
    };

    const deleteReport = async (id) => {
        await fetchWithAuth('/reports/delete', {
            method: 'DELETE',
            body: JSON.stringify({ player: id }),
        });
        loadData();
    };

    const deleteNews = async (id) => {
        await fetchWithAuth('/news/delete', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        loadData();
    };

    const deleteMsg = async (id) => {
        await fetchWithAuth('/msg/delete', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        loadData();
    };

    const deleteSuspection = async (id) => {
        await fetchWithAuth('/suspections/delete', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        loadData();
    };

    const updateNews = async () => {
        if (!editingNews) return;
        await fetchWithAuth('/news/edit', {
            method: 'PUT',
            body: JSON.stringify({
                id: editingNews.id,
                title: editingNews.title,
                content: editingNews.content,
                level: editingNews.level,
            }),
        });
        setEditingNews(null);
        loadData();
    };

    const updateReport = async () => {
        if (!editingReport) return;
        await fetchWithAuth('/reports/edit', {
            method: 'PUT',
            body: JSON.stringify({
                id: editingReport.id,
                player: editingReport.player,
                content: editingReport.content,
            }),
        });
        setEditingReport(null);
        loadData();
    };

    const updateSuspection = async () => {
        if (!editingSuspection) return;
        await fetchWithAuth('/suspections/edit', {
            method: 'PUT',
            body: JSON.stringify({
                id: editingSuspection.id,
                title: editingSuspection.title,
                description: editingSuspection.description,
                subject: editingSuspection.subject,
            }),
        });
        setEditingSuspection(null);
        loadData();
    };

    const createUser = async () => {
        await fetchWithAuth('/staff/users/create', {
            method: 'POST',
            body: JSON.stringify(newUser),
        });
        setNewUser({ username: '', password: '', permissions: '', ign: '' });
        loadData();
    };

    const deleteUser = async (username) => {
        await fetchWithAuth('/staff/users/delete', {
            method: 'DELETE',
            body: JSON.stringify({ username }),
        });
        loadData();
    };

    const createRole = async () => {
        await fetchWithAuth('/staff/roles/create', {
            method: 'POST',
            body: JSON.stringify({ name: newRole.name, perms: selectedPerms }),
        });
        setNewRole({ name: '', perms: [] });
        setSelectedPerms([]);
        loadData();
    };

    const deleteRole = async (id) => {
        await fetchWithAuth('/staff/roles/delete', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
        loadData();
    };

    const updateRole = async () => {
        if (!editingRole) return;
        let permsToSend = [];
        try {
            if (Array.isArray(editingRole.perms)) {
                permsToSend = editingRole.perms;
            } else if (typeof editingRole.perms === 'string') {
                permsToSend = JSON.parse(editingRole.perms);
            }
        } catch (e) {
            permsToSend = [];
        }
        await fetchWithAuth('/staff/roles/edit', {
            method: 'PUT',
            body: JSON.stringify({
                id: editingRole.id,
                name: editingRole.name,
                perms: permsToSend,
            }),
        });
        setEditingRole(null);
        loadData();
    };

    const searchPlayer = async () => {
        if (!playerSearch.trim()) return;
        try {
            const result = await fetchWithAuth(`/player/${playerSearch}`);
            if (result.data) {
                setSelectedPlayer(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch player:', err);
        }
    };

    const sendPlayerToServer = async (playerName, serverName) => {
        try {
            const result = await fetch(`${API_BASE}/player/send/${playerName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ server: serverName }),
            });
            const data = await result.json();
            if (data.success) {
                // Update the selected player's current server with animation
                setSelectedPlayer(prev => ({
                    ...prev,
                    currentServer: serverName
                }));

                // Also update in livePlayers list
                setLivePlayers(prev => prev.map(p =>
                    p.name === playerName ? { ...p, currentServer: serverName } : p
                ));

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
                successMsg.textContent = `✓ ${playerName} sent to ${serverName}!`;
                document.body.appendChild(successMsg);
                setTimeout(() => successMsg.remove(), 3000);
            } else {
                alert('Failed to send player');
            }
        } catch (err) {
            console.error('Failed to send player:', err);
            alert('Error sending player to server');
        }
    };

    // Moderation functions
    const kickPlayer = async () => {
        if (!selectedPlayer) return;
        try {
            const result = await fetch(`${API_BASE}/moderation/kick`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    player: selectedPlayer.name,
                    format: moderationForm.format || null,
                    reason: moderationForm.reason || null,
                }),
            });
            const data = await result.json();
            if (data.success) {
                showSuccessMessage(`✓ ${selectedPlayer.name} has been kicked!`);
                setShowModerationDialog(null);
                setModerationForm({ format: '', reason: '', time: '' });
                setSelectedPlayer(null);
                loadData();
            } else {
                alert(`Failed to kick player: ${data.main?.msg || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to kick player:', err);
            alert('Error kicking player');
        }
    };

    const banPlayer = async () => {
        if (!selectedPlayer) return;
        try {
            const result = await fetch(`${API_BASE}/moderation/ban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    player: selectedPlayer.name,
                    format: moderationForm.format || null,
                    reason: moderationForm.reason || null,
                }),
            });
            const data = await result.json();
            if (data.success) {
                showSuccessMessage(`✓ ${selectedPlayer.name} has been banned!`);
                setShowModerationDialog(null);
                setModerationForm({ format: '', reason: '', time: '' });
                setSelectedPlayer(null);
                loadData();
            } else {
                alert(`Failed to ban player: ${data.main?.msg || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to ban player:', err);
            alert('Error banning player');
        }
    };

    const tempbanPlayer = async () => {
        if (!selectedPlayer || !moderationForm.time) {
            alert('Please specify a time duration (e.g., 2d, 1h, 30m)');
            return;
        }
        try {
            const result = await fetch(`${API_BASE}/moderation/tempban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    player: selectedPlayer.name,
                    time: moderationForm.time,
                    format: moderationForm.format || null,
                    reason: moderationForm.reason || null,
                }),
            });
            const data = await result.json();
            if (data.success) {
                showSuccessMessage(`✓ ${selectedPlayer.name} has been temp-banned for ${moderationForm.time}!`);
                setShowModerationDialog(null);
                setModerationForm({ format: '', reason: '', time: '' });
                setSelectedPlayer(null);
                loadData();
            } else {
                alert(`Failed to tempban player: ${data.main?.msg || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to tempban player:', err);
            alert('Error temp-banning player');
        }
    };

    const warnPlayer = async () => {
        if (!selectedPlayer) return;
        try {
            const result = await fetch(`${API_BASE}/moderation/warn`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    player: selectedPlayer.name,
                    format: moderationForm.format || null,
                    reason: moderationForm.reason || null,
                }),
            });
            const data = await result.json();
            if (data.success) {
                showSuccessMessage(`✓ ${selectedPlayer.name} has been warned!`);
                setShowModerationDialog(null);
                setModerationForm({ format: '', reason: '', time: '' });
            } else {
                alert(`Failed to warn player: ${data.main?.msg || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to warn player:', err);
            alert('Error warning player');
        }
    };

    const showSuccessMessage = (message) => {
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
        successMsg.textContent = message;
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
    };

    const viewServerLogs = async (serverId) => {
        try {
            const result = await fetchWithAuth(`/servers/logs/get/${serverId}`);
            if (result.data) {
                setServerLogs(result.data);
            }
        } catch (err) {
            console.error('Failed to fetch server logs:', err);
            setServerLogs([]);
        }
    };

    const performServerAction = async (serverId, action) => {
        try {
            const result = await fetch(`${API_BASE}/servers/action/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: serverId }),
            });
            const data = await result.json();
            if (data.success) {
                const successMsg = document.createElement('div');
                successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
                successMsg.textContent = `✓ Server ${action.replace('_', ' ')} successful!`;
                document.body.appendChild(successMsg);
                setTimeout(() => successMsg.remove(), 3000);
            } else {
                alert(`Failed to ${action.replace('_', ' ')}`);
            }
        } catch (err) {
            console.error('Server action failed:', err);
            alert('Error performing server action');
        }
    };

    const availablePermissions = [
        'userCreation', 'userDeletion', 'userView',
        'bugCreation', 'bugDeletion', 'bugView',
        'reportCreation', 'reportDeletion', 'reportView',
        'msgCreation', 'msgDeletion', 'msgView',
        'newsCreation', 'newsEdit', 'newsDeletion', 'newsView',
        'serverView', 'serverLogsView', 'serverViewProxy', 'serverAction',
        'suspectionCreation', 'suspectionEdit', 'suspectionDeletion', 'suspectionView',
        'roleCreation', 'roleEdit', 'roleDeletion', 'roleView',
        'livePlayersView', 'playerView', 'playerSend'
    ];

    const togglePermission = (perm) => {
        setSelectedPerms(prev =>
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const toggleEditPermission = (perm) => {
        if (!editingRole) return;
        let currentPerms = [];
        try {
            if (Array.isArray(editingRole.perms)) {
                currentPerms = editingRole.perms;
            } else if (typeof editingRole.perms === 'string') {
                currentPerms = JSON.parse(editingRole.perms);
            }
        } catch (e) {
            currentPerms = [];
        }
        const newPerms = currentPerms.includes(perm)
            ? currentPerms.filter(p => p !== perm)
            : [...currentPerms, perm];
        setEditingRole({ ...editingRole, perms: newPerms });
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700 animate-fade-in">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">GamingBlock</h1>
                        <p className="text-gray-400">Staff Dashboard</p>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input
                                type="text"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                placeholder="Enter password"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition transform hover:scale-105 disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'players', label: 'Players', icon: Gamepad2 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'roles', label: 'Roles', icon: Shield },
        { id: 'bugs', label: 'Bugs', icon: Bug },
        { id: 'reports', label: 'Reports', icon: AlertTriangle },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'news', label: 'News', icon: Newspaper },
        { id: 'servers', label: 'Servers', icon: Server },
        { id: 'suspections', label: 'Suspections', icon: Shield },
        { id: 'logs', label: 'Logs', icon: ScrollText },
    ];

    return (
        <div className="min-h-screen bg-gray-900 flex">
            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }
      `}</style>

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    {sidebarOpen && <h2 className="text-xl font-bold text-white">GamingBlock</h2>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg transition">
                        {sidebarOpen ? <X className="text-white" size={20} /> : <Menu className="text-white" size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                                    activeTab === item.id
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'text-white hover:bg-gray-700'
                                }`}
                            >
                                <Icon size={20} />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <button
                    onClick={() => {
                        setToken('');
                        localStorage.removeItem('token');
                    }}
                    className="m-4 flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-700 transition"
                >
                    <LogOut size={20} />
                    {sidebarOpen && <span>Logout</span>}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                        {menuItems.find(item => item.id === activeTab)?.label}
                        <ChevronRight className="text-gray-600" size={24} />
                    </h1>

                    {/* Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg card-hover cursor-pointer">
                                <Users size={32} className="mb-4 opacity-80" />
                                <h3 className="text-4xl font-bold mb-2">{users.length}</h3>
                                <p className="text-blue-100">Total Users</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg card-hover cursor-pointer">
                                <Gamepad2 size={32} className="mb-4 opacity-80" />
                                <h3 className="text-4xl font-bold mb-2">{livePlayers.length}</h3>
                                <p className="text-green-100">Online Players</p>
                            </div>
                            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg card-hover cursor-pointer">
                                <Bug size={32} className="mb-4 opacity-80" />
                                <h3 className="text-4xl font-bold mb-2">{bugs.length}</h3>
                                <p className="text-red-100">Active Bugs</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg card-hover cursor-pointer">
                                <AlertTriangle size={32} className="mb-4 opacity-80" />
                                <h3 className="text-4xl font-bold mb-2">{reports.length}</h3>
                                <p className="text-yellow-100">Reports</p>
                            </div>
                        </div>
                    )}

                    {/* Players */}
                    {activeTab === 'players' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Search Bar */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">Search Player</h3>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Enter player name..."
                                        value={playerSearch}
                                        onChange={(e) => setPlayerSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchPlayer()}
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    />
                                    <button
                                        onClick={searchPlayer}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                                    >
                                        <Search size={20} />
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Live Players */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white">Live Players ({livePlayers.length})</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-green-400 text-sm font-semibold">LIVE</span>
                                    </div>
                                </div>

                                {livePlayers.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Gamepad2 size={48} className="mx-auto mb-4 text-gray-600" />
                                        <p className="text-gray-400">No players online</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {livePlayers.map((player, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setSelectedPlayer(player)}
                                                className="bg-gray-700 rounded-xl p-4 border border-gray-600 hover:border-green-500 transition cursor-pointer card-hover"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={`https://mc-heads.net/avatar/${player.name}/48`}
                                                        alt={player.name}
                                                        className="w-12 h-12 rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="text-white font-bold">{player.name}</h4>
                                                        <p className="text-sm text-gray-400">{player.currentServer}</p>
                                                    </div>
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Player Detail Popup */}
                    {selectedPlayer && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
                            onClick={() => setSelectedPlayer(null)}
                        >
                            <div
                                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full my-8 animate-fade-in max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="sticky top-0 z-10 relative bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6">
                                    <button
                                        onClick={() => setSelectedPlayer(null)}
                                        className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={`https://mc-heads.net/avatar/${selectedPlayer.name}/128`}
                                            alt={selectedPlayer.name}
                                            className="w-24 h-24 rounded-xl shadow-lg mb-4"
                                        />
                                        <h2 className="text-2xl font-bold text-white">{selectedPlayer.name}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            {selectedPlayer.online && (
                                                <>
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                    <span className="text-white text-sm font-semibold">Online</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-4">
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-1">Current Server</p>
                                        <p className="text-white font-semibold text-lg transition-all duration-500">{selectedPlayer.currentServer || 'Unknown'}</p>
                                    </div>

                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-1">Last Join</p>
                                        <p className="text-white font-semibold">{selectedPlayer.lastJoin || 'Never'}</p>
                                    </div>

                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-1">Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${selectedPlayer.online ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                            <p className={`font-semibold ${selectedPlayer.online ? 'text-green-400' : 'text-gray-400'}`}>
                                                {selectedPlayer.online ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Player Head with Body */}
                                    <div className="bg-gray-700 rounded-lg p-4 flex justify-center">
                                        <img
                                            src={`https://mc-heads.net/body/${selectedPlayer.name}/200`}
                                            alt={`${selectedPlayer.name} body`}
                                            className="h-48"
                                        />
                                    </div>

                                    {/* Send to Server */}
                                    {selectedPlayer.online && proxyServers.length > 0 && (
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm mb-3">Send to Server</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {proxyServers.map((server, i) => {
                                                    const isCurrentServer = selectedPlayer.currentServer === server;
                                                    return (
                                                        <button
                                                            key={i}
                                                            onClick={() => sendPlayerToServer(selectedPlayer.name, server)}
                                                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform ${
                                                                isCurrentServer
                                                                    ? 'bg-green-500 text-white scale-105 shadow-lg cursor-not-allowed'
                                                                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                                                            }`}
                                                            disabled={isCurrentServer}
                                                        >
                                                            {isCurrentServer && (
                                                                <span className="inline-block mr-1">✓</span>
                                                            )}
                                                            {server}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Moderation Actions */}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-3">Moderation Actions</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setShowModerationDialog('warn')}
                                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                            >
                                                Warn
                                            </button>
                                            <button
                                                onClick={() => setShowModerationDialog('kick')}
                                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                            >
                                                Kick
                                            </button>
                                            <button
                                                onClick={() => setShowModerationDialog('tempban')}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                            >
                                                Temp Ban
                                            </button>
                                            <button
                                                onClick={() => setShowModerationDialog('ban')}
                                                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                            >
                                                Ban
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Moderation Dialog */}
                    {showModerationDialog && selectedPlayer && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                            onClick={() => {
                                setShowModerationDialog(null);
                                setModerationForm({ format: '', reason: '', time: '' });
                            }}
                        >
                            <div
                                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full animate-fade-in"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className={`relative rounded-t-2xl p-6 ${
                                    showModerationDialog === 'warn' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                    showModerationDialog === 'kick' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                    showModerationDialog === 'tempban' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                    'bg-gradient-to-r from-red-700 to-red-800'
                                }`}>
                                    <button
                                        onClick={() => {
                                            setShowModerationDialog(null);
                                            setModerationForm({ format: '', reason: '', time: '' });
                                        }}
                                        className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition"
                                    >
                                        <X size={20} />
                                    </button>
                                    <h2 className="text-2xl font-bold text-white capitalize">
                                        {showModerationDialog === 'tempban' ? 'Temporary Ban' : showModerationDialog} {selectedPlayer.name}
                                    </h2>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-4">
                                    {showModerationDialog === 'tempban' && (
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">Duration (e.g., 2d, 1h, 30m) *</label>
                                            <input
                                                type="text"
                                                placeholder="e.g., 2d, 1h, 30m"
                                                value={moderationForm.time}
                                                onChange={(e) => setModerationForm({ ...moderationForm, time: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Format/Category (optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., @hacking, @spam"
                                            value={moderationForm.format}
                                            onChange={(e) => setModerationForm({ ...moderationForm, format: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Reason (optional)</label>
                                        <textarea
                                            placeholder="Enter reason..."
                                            value={moderationForm.reason}
                                            onChange={(e) => setModerationForm({ ...moderationForm, reason: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                                            rows="3"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => {
                                                setShowModerationDialog(null);
                                                setModerationForm({ format: '', reason: '', time: '' });
                                            }}
                                            className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (showModerationDialog === 'warn') warnPlayer();
                                                else if (showModerationDialog === 'kick') kickPlayer();
                                                else if (showModerationDialog === 'tempban') tempbanPlayer();
                                                else if (showModerationDialog === 'ban') banPlayer();
                                            }}
                                            className={`flex-1 px-4 py-3 text-white rounded-lg font-semibold transition ${
                                                showModerationDialog === 'warn' ? 'bg-yellow-500 hover:bg-yellow-600' :
                                                showModerationDialog === 'kick' ? 'bg-orange-500 hover:bg-orange-600' :
                                                showModerationDialog === 'tempban' ? 'bg-red-500 hover:bg-red-600' :
                                                'bg-red-700 hover:bg-red-800'
                                            }`}
                                        >
                                            Confirm {showModerationDialog === 'tempban' ? 'Temp Ban' : showModerationDialog.charAt(0).toUpperCase() + showModerationDialog.slice(1)}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users */}
                    {activeTab === 'users' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">Create New User</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <select
                                        value={newUser.permissions}
                                        onChange={(e) => setNewUser({ ...newUser, permissions: e.target.value })}
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    >
                                        <option value="">Select Role</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="IGN (In-Game Name)"
                                        value={newUser.ign}
                                        onChange={(e) => setNewUser({ ...newUser, ign: e.target.value })}
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                </div>
                                <button onClick={createUser} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                                    <Plus size={20} className="inline mr-2" />
                                    Create User
                                </button>
                            </div>

                            <div className="grid gap-4">
                                {users.map((user, i) => (
                                    <div key={i} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg card-hover">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{user.name}</h3>
                                                <p className="text-gray-400 text-sm">IGN: {user.ign}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            user.permissions === 'admin'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {user.permissions}
                        </span>
                                                <button
                                                    onClick={() => deleteUser(user.name)}
                                                    className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Roles */}
                    {activeTab === 'roles' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">Create New Role</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Role name"
                                        value={newRole.name}
                                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <div>
                                        <p className="text-gray-300 mb-3 font-medium">Select Permissions:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {availablePermissions.map(perm => (
                                                <label key={perm} className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPerms.includes(perm)}
                                                        onChange={() => togglePermission(perm)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm text-gray-200">{perm}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                                        {JSON.stringify(selectedPerms, null, 2)}
                                    </div>
                                    <button onClick={createRole} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                                        <Plus size={20} className="inline mr-2" />
                                        Create Role
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {roles.length === 0 ? (
                                    <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
                                        <Shield size={48} className="mx-auto mb-4 text-gray-600" />
                                        <p className="text-gray-400">No roles found. Create your first role!</p>
                                    </div>
                                ) : (
                                    roles.map((role) => {
                                        let rolePerms = [];
                                        try {
                                            if (Array.isArray(role.perms)) {
                                                rolePerms = role.perms;
                                            } else if (typeof role.perms === 'string') {
                                                rolePerms = JSON.parse(role.perms);
                                            }
                                            if (!Array.isArray(rolePerms)) {
                                                rolePerms = [];
                                            }
                                        } catch (e) {
                                            console.error('Error parsing role perms:', e);
                                            rolePerms = [];
                                        }

                                        return (
                                            <div key={role.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg card-hover">
                                                {editingRole?.id === role.id ? (
                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            value={editingRole.name}
                                                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                            placeholder="Role name"
                                                        />
                                                        <div>
                                                            <p className="text-gray-300 mb-3 font-medium">Edit Permissions:</p>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                                {availablePermissions.map(perm => {
                                                                    let currentPerms = [];
                                                                    try {
                                                                        if (Array.isArray(editingRole.perms)) {
                                                                            currentPerms = editingRole.perms;
                                                                        } else if (typeof editingRole.perms === 'string') {
                                                                            currentPerms = JSON.parse(editingRole.perms);
                                                                        }
                                                                    } catch (e) {
                                                                        currentPerms = [];
                                                                    }
                                                                    return (
                                                                        <label key={perm} className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-600 transition">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={currentPerms.includes(perm)}
                                                                                onChange={() => toggleEditPermission(perm)}
                                                                                className="w-4 h-4"
                                                                            />
                                                                            <span className="text-sm text-gray-200">{perm}</span>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button onClick={updateRole} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition">
                                                                Save
                                                            </button>
                                                            <button onClick={() => setEditingRole(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-white mb-3">{role.name}</h3>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {rolePerms.length > 0 ? (
                                                                        rolePerms.map(perm => (
                                                                            <span key={perm} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                        {perm}
                                      </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-gray-500 text-sm italic">No permissions assigned</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                <button
                                                                    onClick={() => setEditingRole({ ...role, perms: rolePerms })}
                                                                    className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                                >
                                                                    <Edit size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteRole(role.id)}
                                                                    className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bugs */}
                    {activeTab === 'bugs' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">Report New Bug</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Bug name"
                                        value={newBug.name}
                                        onChange={(e) => setNewBug({ ...newBug, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <textarea
                                        placeholder="Bug description"
                                        value={newBug.content}
                                        onChange={(e) => setNewBug({ ...newBug, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                    />
                                    <button onClick={createBug} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                                        <Plus size={20} className="inline mr-2" />
                                        Create Bug Report
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {bugs.map((bug) => (
                                    <div key={bug.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg card-hover">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-white mb-2">{bug.name}</h3>
                                                <p className="text-gray-400 mb-3">{bug.content}</p>
                                                {bug.date && <p className="text-sm text-gray-500">{new Date(bug.date).toLocaleString()}</p>}
                                            </div>
                                            <button
                                                onClick={() => deleteBug(bug.name)}
                                                className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reports */}
                    {activeTab === 'reports' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">Create New Report</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Player name"
                                        value={newReport.player}
                                        onChange={(e) => setNewReport({ ...newReport, player: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <textarea
                                        placeholder="Report content"
                                        value={newReport.content}
                                        onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                    />
                                    <button onClick={createReport} className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                                        <Plus size={20} className="inline mr-2" />
                                        Submit Report
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {reports.map((report) => (
                                    <div key={report.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg card-hover">
                                        {editingReport?.id === report.id ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={editingReport.player}
                                                    onChange={(e) => setEditingReport({ ...editingReport, player: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                    placeholder="Player name"
                                                />
                                                <textarea
                                                    value={editingReport.content}
                                                    onChange={(e) => setEditingReport({ ...editingReport, content: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                                    placeholder="Report content"
                                                />
                                                <div className="flex gap-3">
                                                    <button onClick={updateReport} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition">
                                                        Save
                                                    </button>
                                                    <button onClick={() => setEditingReport(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-xl font-bold text-white">Player: {report.player}</h3>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingReport(report)}
                                                            className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteReport(report.player)}
                                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400">{report.content}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {activeTab === 'messages' && (
                        <div className="space-y-6 animate-fade-in relative">
                            {/* Chat Container */}
                            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
                                {/* Chat Header */}
                                <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                                    <h3 className="text-xl font-bold text-white">Staff Chat</h3>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-500 mt-8">
                                            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div key={msg.id || i} className="flex gap-3 animate-fade-in">
                                                {/* Avatar */}
                                                <div
                                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-green-400 transition"
                                                    onClick={() => setSelectedChatUser(msg.sender)}
                                                >
                                                    {(msg.sender || 'U')[0].toUpperCase()}
                                                </div>
                                                {/* Message Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2 mb-1">
                            <span
                                className="text-white font-semibold cursor-pointer hover:underline"
                                onClick={() => setSelectedChatUser(msg.sender)}
                            >
                              {msg.sender || 'Unknown User'}
                            </span>
                                                        <span className="text-xs text-gray-500">{msg.date ? new Date(msg.date).toLocaleString() : 'Just now'}</span>
                                                    </div>
                                                    <div className="bg-gray-700 rounded-lg rounded-tl-none px-4 py-2 flex items-center justify-between">
                                                        <p className="text-gray-200 flex-1">{msg.content || '(empty message)'}</p>
                                                        <button
                                                            onClick={() => deleteMsg(msg.id)}
                                                            className="text-red-400 hover:text-red-300 ml-3 p-1 hover:bg-gray-600 rounded transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Type your message..."
                                            value={newMessage.msg}
                                            onChange={(e) => setNewMessage({ msg: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && newMessage.msg.trim() && sendMessage()}
                                            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!newMessage.msg.trim()}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Slack-style User Info Sidebar */}
                            {selectedChatUser && (
                                <div className="fixed top-0 right-0 h-full w-80 bg-gray-800 border-l border-gray-700 shadow-2xl z-50 animate-slide-in overflow-y-auto">
                                    <style>{`
                    @keyframes slide-in {
                      from { transform: translateX(100%); }
                      to { transform: translateX(0); }
                    }
                    .animate-slide-in {
                      animation: slide-in 0.3s ease-out;
                    }
                  `}</style>

                                    {/* Header */}
                                    <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white">Profile</h3>
                                        <button
                                            onClick={() => setSelectedChatUser(null)}
                                            className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* User Info */}
                                    <div className="p-6 space-y-4">
                                        {/* Avatar */}
                                        <div className="flex justify-center">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                                {selectedChatUser[0].toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold text-white">{selectedChatUser}</h2>
                                            <p className="text-gray-400 text-sm mt-1">Staff Member</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                                            <div>
                                                <p className="text-gray-400 text-xs mb-1">Total Messages</p>
                                                <p className="text-white font-semibold text-lg">
                                                    {messages.filter(m => m.sender === selectedChatUser).length}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs mb-1">Last Active</p>
                                                <p className="text-white font-semibold">
                                                    {(() => {
                                                        const userMessages = messages.filter(m => m.sender === selectedChatUser);
                                                        if (userMessages.length === 0) return 'Never';
                                                        const lastMsg = userMessages[userMessages.length - 1];
                                                        return lastMsg.date ? new Date(lastMsg.date).toLocaleString() : 'Recently';
                                                    })()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Recent Messages */}
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-xs mb-3">Recent Messages</p>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {messages
                                                    .filter(m => m.sender === selectedChatUser)
                                                    .slice(-5)
                                                    .map((msg, i) => (
                                                        <div key={i} className="bg-gray-600 rounded p-2">
                                                            <p className="text-white text-sm">{msg.content}</p>
                                                            <p className="text-gray-400 text-xs mt-1">
                                                                {msg.date ? new Date(msg.date).toLocaleString() : 'Just now'}
                                                            </p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* News */}
                    {activeTab === 'news' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">Create News</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="News title"
                                        value={newNews.title}
                                        onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <textarea
                                        placeholder="News content"
                                        value={newNews.content}
                                        onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-32"
                                    />
                                    <select
                                        value={newNews.level}
                                        onChange={(e) => setNewNews({ ...newNews, level: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    >
                                        {[1, 2, 3, 4, 5].map(level => (
                                            <option key={level} value={level}>Level {level}</option>
                                        ))}
                                    </select>
                                    <button onClick={createNews} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                                        <Plus size={20} className="inline mr-2" />
                                        Publish News
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {news.map((item) => (
                                    <div key={item.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg card-hover">
                                        {editingNews?.id === item.id ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={editingNews.title}
                                                    onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                    placeholder="News title"
                                                />
                                                <textarea
                                                    value={editingNews.content}
                                                    onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-32"
                                                    placeholder="News content"
                                                />
                                                <select
                                                    value={editingNews.level}
                                                    onChange={(e) => setEditingNews({ ...editingNews, level: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                >
                                                    {[1, 2, 3, 4, 5].map(level => (
                                                        <option key={level} value={level}>Level {level}</option>
                                                    ))}
                                                </select>
                                                <div className="flex gap-3">
                                                    <button onClick={updateNews} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition">
                                                        Save
                                                    </button>
                                                    <button onClick={() => setEditingNews(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                                                    <div className="flex items-center gap-2">
                            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                              Level {item.level}
                            </span>
                                                        <button
                                                            onClick={() => setEditingNews({ id: item.id, title: item.title, content: item.msg, level: item.level })}
                                                            className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteNews(item.id)}
                                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 mb-3">{item.msg}</p>
                                                <div className="flex items-center justify-between text-sm text-gray-500">
                                                    <span>By {item.author}</span>
                                                    <span>{new Date(item.creation).toLocaleDateString()}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Servers */}
                    {activeTab === 'servers' && (
                        <div className="grid gap-4 animate-fade-in">
                            {servers.length === 0 ? (
                                <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
                                    <Server size={48} className="mx-auto mb-4 text-gray-600" />
                                    <p className="text-gray-400">No servers found</p>
                                </div>
                            ) : (
                                servers.map((server, i) => (
                                    <div
                                        key={i}
                                        className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg card-hover cursor-pointer"
                                        onClick={() => {
                                            setSelectedServer(server);
                                            viewServerLogs(server.server_id);
                                        }}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">{server.server_name}</h3>
                                                <p className="text-sm text-gray-500 font-mono">{server.server_id}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                server.auto_start
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                        {server.auto_start ? 'Auto-start' : 'Manual'}
                      </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">Type</p>
                                                <p className="font-semibold text-white capitalize">{server.type.replace('minecraft-', '')}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">Port</p>
                                                <p className="font-semibold text-white font-mono">{server.server_port}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">Executable</p>
                                                <p className="font-semibold text-white text-sm truncate">{server.executable}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-sm mb-1">Created</p>
                                                <p className="font-semibold text-white text-sm">{new Date(server.created).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <p className="text-sm text-gray-400 mb-2">Execution Command:</p>
                                            <code className="text-xs bg-gray-900 text-green-400 px-3 py-2 rounded block overflow-x-auto">
                                                {server.execution_command}
                                            </code>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Server Details Modal */}
                    {selectedServer && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
                            onClick={() => {
                                setSelectedServer(null);
                                setServerLogs([]);
                            }}
                        >
                            <div
                                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-4xl w-full my-8 animate-fade-in max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6">
                                    <button
                                        onClick={() => {
                                            setSelectedServer(null);
                                            setServerLogs([]);
                                        }}
                                        className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <Server size={48} className="text-white" />
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{selectedServer.server_name}</h2>
                                            <p className="text-blue-100 text-sm font-mono">{selectedServer.server_id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-4">
                                    {/* Action Buttons */}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-3">Server Actions</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => performServerAction(selectedServer.server_id, 'start_server')}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition"
                                            >
                                                ▶ Start
                                            </button>
                                            <button
                                                onClick={() => performServerAction(selectedServer.server_id, 'stop_server')}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-semibold transition"
                                            >
                                                ■ Stop
                                            </button>
                                            <button
                                                onClick={() => performServerAction(selectedServer.server_id, 'restart_server')}
                                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-semibold transition"
                                            >
                                                ↻ Restart
                                            </button>
                                        </div>
                                    </div>

                                    {/* Server Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm mb-1">Type</p>
                                            <p className="text-white font-semibold">{selectedServer.type}</p>
                                        </div>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm mb-1">Port</p>
                                            <p className="text-white font-semibold font-mono">{selectedServer.server_port}</p>
                                        </div>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm mb-1">Executable</p>
                                            <p className="text-white font-semibold text-sm">{selectedServer.executable}</p>
                                        </div>
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm mb-1">Auto Start</p>
                                            <p className={`font-semibold ${selectedServer.auto_start ? 'text-green-400' : 'text-gray-400'}`}>
                                                {selectedServer.auto_start ? 'Enabled' : 'Disabled'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Server Logs */}
                                    <div className="bg-gray-900 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-gray-400 text-sm font-semibold">Server Logs</p>
                                            <button
                                                onClick={() => viewServerLogs(selectedServer.server_id)}
                                                className="text-blue-400 hover:text-blue-300 text-sm"
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                        <div className="bg-black rounded p-3 max-h-96 overflow-y-auto font-mono text-xs">
                                            {serverLogs.length === 0 ? (
                                                <p className="text-gray-500 text-center py-4">Loading logs...</p>
                                            ) : (
                                                serverLogs.map((log, i) => (
                                                    <div
                                                        key={i}
                                                        className={`py-0.5 ${
                                                            log.includes('[ERROR]') || log.includes('ERROR') ? 'text-red-400' :
                                                                log.includes('[WARN]') || log.includes('WARN') ? 'text-yellow-400' :
                                                                    log.includes('[INFO]') || log.includes('INFO') ? 'text-green-400' :
                                                                        'text-gray-300'
                                                        }`}
                                                    >
                                                        {log}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Suspections */}
                    {activeTab === 'suspections' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <h3 className="text-xl font-bold text-white mb-4">Create Suspection</h3>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={newSuspection.title}
                                        onChange={(e) => setNewSuspection({ ...newSuspection, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={newSuspection.subject}
                                        onChange={(e) => setNewSuspection({ ...newSuspection, subject: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                    <textarea
                                        placeholder="Description"
                                        value={newSuspection.description}
                                        onChange={(e) => setNewSuspection({ ...newSuspection, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                    />
                                    <button onClick={createSuspection} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition">
                                        <Plus size={20} className="inline mr-2" />
                                        Create Suspection
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {suspections.map((sus) => (
                                    <div key={sus.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg card-hover">
                                        {editingSuspection?.id === sus.id ? (
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    value={editingSuspection.title}
                                                    onChange={(e) => setEditingSuspection({ ...editingSuspection, title: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={editingSuspection.subject}
                                                    onChange={(e) => setEditingSuspection({ ...editingSuspection, subject: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                                    placeholder="Subject"
                                                />
                                                <textarea
                                                    value={editingSuspection.description}
                                                    onChange={(e) => setEditingSuspection({ ...editingSuspection, description: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                                                    placeholder="Description"
                                                />
                                                <div className="flex gap-3">
                                                    <button onClick={updateSuspection} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition">
                                                        Save
                                                    </button>
                                                    <button onClick={() => setEditingSuspection(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-white">{sus.title}</h3>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingSuspection(sus)}
                                                            className="text-blue-400 hover:text-blue-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSuspection(sus.id)}
                                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-700 rounded-lg transition"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 mb-2">Subject: {sus.subject}</p>
                                                <p className="text-gray-300">{sus.description}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Logs */}
                    {activeTab === 'logs' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Header with Stats */}
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Activity Logs</h2>
                                        <p className="text-purple-100">Monitor all staff actions and system events</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-6 py-4">
                                        <p className="text-purple-100 text-sm mb-1">Total Logs</p>
                                        <p className="text-4xl font-bold text-white">{actionLogs.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Filters and Search */}
                            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search logs (username, action, endpoint)..."
                                            value={logSearch}
                                            onChange={(e) => setLogSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>

                                    {/* Filter */}
                                    <select
                                        value={logFilter}
                                        onChange={(e) => setLogFilter(e.target.value)}
                                        className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="all">All Actions</option>
                                        <option value="user">User Management</option>
                                        <option value="player">Player Actions</option>
                                        <option value="moderation">Moderation</option>
                                        <option value="bug">Bug Reports</option>
                                        <option value="report">Reports</option>
                                        <option value="news">News</option>
                                        <option value="server">Server Actions</option>
                                        <option value="role">Role Management</option>
                                        <option value="message">Messages</option>
                                        <option value="suspection">Suspections</option>
                                    </select>
                                </div>
                            </div>

                            {/* Logs List */}
                            <div className="space-y-3">
                                {actionLogs
                                    .filter(log => {
                                        // Apply search filter
                                        const searchLower = logSearch.toLowerCase();
                                        const matchesSearch = !logSearch ||
                                            log.username?.toLowerCase().includes(searchLower) ||
                                            log.action?.toLowerCase().includes(searchLower) ||
                                            log.endpoint?.toLowerCase().includes(searchLower) ||
                                            log.message?.toLowerCase().includes(searchLower) ||
                                            log.target?.toLowerCase().includes(searchLower);

                                        // Apply category filter
                                        const matchesFilter = logFilter === 'all' ||
                                            (logFilter === 'user' && (log.action?.includes('user') || log.endpoint?.includes('user'))) ||
                                            (logFilter === 'player' && (log.action?.includes('player') || log.endpoint?.includes('player'))) ||
                                            (logFilter === 'moderation' && (log.action?.includes('kick') || log.action?.includes('ban') || log.action?.includes('warn') || log.endpoint?.includes('moderation'))) ||
                                            (logFilter === 'bug' && (log.action?.includes('bug') || log.endpoint?.includes('bug'))) ||
                                            (logFilter === 'report' && (log.action?.includes('report') || log.endpoint?.includes('report'))) ||
                                            (logFilter === 'news' && (log.action?.includes('news') || log.endpoint?.includes('news'))) ||
                                            (logFilter === 'server' && (log.action?.includes('server') || log.endpoint?.includes('server'))) ||
                                            (logFilter === 'role' && (log.action?.includes('role') || log.endpoint?.includes('role'))) ||
                                            (logFilter === 'message' && (log.action?.includes('message') || log.endpoint?.includes('msg'))) ||
                                            (logFilter === 'suspection' && (log.action?.includes('suspection') || log.endpoint?.includes('suspection')));

                                        return matchesSearch && matchesFilter;
                                    })
                                    .map((log, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedLog(log)}
                                            className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-lg hover:shadow-xl hover:border-purple-500 transition-all duration-300 cursor-pointer card-hover"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {/* Action Badge */}
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            log.action?.includes('kick') || log.action?.includes('ban') || log.action?.includes('warn') || log.action?.includes('delete') ? 'bg-red-500/20 text-red-400' :
                                                            log.action?.includes('create') || log.action?.includes('send') ? 'bg-green-500/20 text-green-400' :
                                                            log.action?.includes('edit') || log.action?.includes('update') ? 'bg-blue-500/20 text-blue-400' :
                                                            log.action?.includes('view') || log.action?.includes('GET') ? 'bg-gray-500/20 text-gray-400' :
                                                            'bg-purple-500/20 text-purple-400'
                                                        }`}>
                                                            {log.action || 'Unknown'}
                                                        </span>

                                                        {/* User Badge */}
                                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                                                            👤 {log.username || 'Unknown'}
                                                        </span>

                                                        {/* Target Badge (if exists) */}
                                                        {log.target && (
                                                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                                                                🎯 {log.target}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Log Message */}
                                                    <p className="text-gray-300 mb-2 font-mono text-sm">{log.message}</p>

                                                    {/* Endpoint */}
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                        <span className="font-mono bg-gray-700 px-2 py-1 rounded">{log.endpoint}</span>
                                                    </div>
                                                </div>

                                                {/* Timestamp */}
                                                <div className="text-right ml-4">
                                                    <p className="text-gray-400 text-xs">
                                                        {new Date(log.timestamp).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-gray-500 text-xs font-mono">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                {/* No Logs Message */}
                                {actionLogs.filter(log => {
                                    const searchLower = logSearch.toLowerCase();
                                    const matchesSearch = !logSearch ||
                                        log.username?.toLowerCase().includes(searchLower) ||
                                        log.action?.toLowerCase().includes(searchLower) ||
                                        log.endpoint?.toLowerCase().includes(searchLower) ||
                                        log.message?.toLowerCase().includes(searchLower);
                                    const matchesFilter = logFilter === 'all' ||
                                        (logFilter === 'user' && log.action?.includes('user')) ||
                                        (logFilter === 'player' && log.action?.includes('player')) ||
                                        (logFilter === 'moderation' && (log.action?.includes('kick') || log.action?.includes('ban') || log.action?.includes('warn')));
                                    return matchesSearch && matchesFilter;
                                }).length === 0 && (
                                    <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
                                        <ScrollText size={48} className="mx-auto text-gray-600 mb-4" />
                                        <p className="text-gray-400 text-lg">No logs found</p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            {logSearch || logFilter !== 'all' ? 'Try adjusting your filters' : 'No activity logged yet'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Log Detail Popup */}
                    {selectedLog && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
                            onClick={() => setSelectedLog(null)}
                        >
                            <div
                                className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full my-8 animate-fade-in"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-2xl p-6">
                                    <button
                                        onClick={() => setSelectedLog(null)}
                                        className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition"
                                    >
                                        <X size={20} />
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-4 rounded-xl">
                                            <ScrollText size={32} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">Log Details</h2>
                                            <p className="text-purple-100 text-sm">ID: {selectedLog.id}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-4">
                                    {/* Action */}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-2">Action</p>
                                        <span className={`inline-block px-4 py-2 rounded-lg text-base font-semibold ${
                                            selectedLog.action?.includes('kick') || selectedLog.action?.includes('ban') || selectedLog.action?.includes('warn') || selectedLog.action?.includes('delete') ? 'bg-red-500/20 text-red-400' :
                                            selectedLog.action?.includes('create') || selectedLog.action?.includes('send') ? 'bg-green-500/20 text-green-400' :
                                            selectedLog.action?.includes('edit') || selectedLog.action?.includes('update') ? 'bg-blue-500/20 text-blue-400' :
                                            selectedLog.action?.includes('view') || selectedLog.action?.includes('GET') ? 'bg-gray-500/20 text-gray-400' :
                                            'bg-purple-500/20 text-purple-400'
                                        }`}>
                                            {selectedLog.action || 'Unknown Action'}
                                        </span>
                                    </div>

                                    {/* User */}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-2">User</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {selectedLog.username?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <p className="text-white font-semibold text-lg">{selectedLog.username || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    {/* Target (if exists) */}
                                    {selectedLog.target && (
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm mb-2">Target</p>
                                            <p className="text-yellow-400 font-semibold text-lg">🎯 {selectedLog.target}</p>
                                        </div>
                                    )}

                                    {/* Message */}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-2">Message</p>
                                        <p className="text-white font-mono text-sm leading-relaxed">{selectedLog.message}</p>
                                    </div>

                                    {/* Endpoint */}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-2">Endpoint</p>
                                        <code className="text-green-400 bg-gray-900 px-3 py-2 rounded block font-mono text-sm">
                                            {selectedLog.endpoint || 'N/A'}
                                        </code>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="bg-gray-700 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm mb-2">Timestamp</p>
                                        <div className="space-y-1">
                                            <p className="text-white font-semibold">
                                                📅 {new Date(selectedLog.timestamp).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-gray-300 font-mono">
                                                🕐 {new Date(selectedLog.timestamp).toLocaleTimeString('en-US', {
                                                    hour12: true,
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Created At (if different from timestamp) */}
                                    {selectedLog.created_at && selectedLog.created_at !== selectedLog.timestamp && (
                                        <div className="bg-gray-700 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm mb-2">Logged At</p>
                                            <p className="text-gray-300 font-mono text-sm">
                                                {new Date(selectedLog.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="bg-gray-700/50 rounded-b-2xl p-4 flex justify-end">
                                    <button
                                        onClick={() => setSelectedLog(null)}
                                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}