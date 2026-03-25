# GamingBlock Internal Management System

## Overview

The GamingBlock Internal Management System is a comprehensive backend service built with Node.js and Express that provides centralized management for a Minecraft server network. It handles staff user management, player moderation, server monitoring, bug tracking, reports, news management, and provides a complete audit logging system.

## Architecture

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 2 (with connection pooling)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Security:** bcrypt
- **HTTP Client:** axios (for external API communication)
- **Validation:** express-validator

### Project Structure
```
gamingblock_internal/
├── server.js                    # Main application entry point
├── modules/                     # Core functionality modules
│   ├── bugs/                   # Bug tracking system
│   ├── reports/                # Player report system
│   ├── staff/                  # Staff management
│   │   ├── users/             # User CRUD operations
│   │   ├── groups/            # Group management
│   │   ├── permissions/       # Role-based access control
│   │   ├── login.js           # Authentication
│   │   ├── hash.js            # Password hashing utilities
│   │   └── msg/               # Internal messaging
│   ├── news/                  # News article management
│   ├── server/                # Server monitoring and control
│   ├── players/               # Player data and actions
│   ├── moderation/            # Player moderation actions
│   ├── suspections/           # Suspicious activity tracking
│   ├── middleware/            # Custom middleware
│   │   ├── authToken.js      # JWT authentication
│   │   ├── signToken.js      # JWT token generation
│   │   ├── permissions.js    # Permission checking
│   │   └── logging.js        # Action logging
│   ├── vars/                  # Shared variables and constructors
│   │   ├── error/            # Error message objects
│   │   ├── success/          # Success message objects
│   │   └── constructor.js    # Response constructor
│   └── db/                    # Database configuration
│       └── pool.js            # MySQL connection pool
├── public/                    # Frontend application
│   └── staff/                # React staff dashboard
└── logs_table.sql            # Database schema for logs

```

## Core Modules

### 1. Authentication & Authorization

#### Authentication (`modules/staff/login.js`, `modules/middleware/authToken.js`)
- **Token Generation:** Creates JWT tokens with configurable expiration
- **Token Verification:** Validates JWT tokens on protected routes
- **Session Management:** Stateless authentication using bearer tokens
- **Security:** Tokens include user identity for request attribution

#### Password Management (`modules/staff/hash.js`)
- **Hashing:** Uses bcrypt with configurable salt rounds for secure password storage
- **Comparison:** Validates passwords against stored hashes
- **Security:** Never stores plain-text passwords

#### Permission System (`modules/middleware/permissions.js`)
- **Role-Based Access Control (RBAC):** Users assigned to roles with specific permissions
- **Permission Checking:** Middleware validates user permissions before endpoint access
- **Granular Permissions:** Each action (create, edit, delete, view) has specific permission requirements
- **Special Permission:** "all" permission grants access to everything

### 2. User Management (`modules/staff/users/`)

#### User Operations
- **createUser:** Creates new staff users with encrypted passwords and assigned roles
- **deleteUser:** Removes users from the system
- **getUsers:** Retrieves list of all staff users with their roles
- **User Data:** Stores username, hashed password, role/permissions, and in-game name (IGN)

#### Role Management (`modules/staff/permissions.js`)
- **createRole:** Defines new roles with specific permission sets
- **editRole:** Updates role names and permission arrays
- **deleteRole:** Removes roles from the system
- **getRoles:** Retrieves all defined roles and their permissions
- **Permission Storage:** Roles store permissions as JSON arrays

### 3. Player Management (`modules/players/`)

#### Player Data
- **getLivePlayers:** Fetches currently online players from the game server connector
- **getPlayer:** Retrieves detailed information about a specific player
- **Player Information:** Name, current server, online status, last join time

#### Player Actions
- **sendPlayerToServer:** Moves players between servers in the network
- **Integration:** Communicates with external Java connector API via HTTP

### 4. Moderation System (`modules/moderation/`)

#### Moderation Actions
All moderation functions connect to the external Java connector API to execute commands on game servers.

- **kickPlayer(player, format, reason):** Removes player from current server
- **banPlayer(player, format, reason):** Permanently bans player from network
- **tempbanPlayer(player, time, format, reason):** Temporarily bans player with time duration
- **warnPlayer(player, format, reason):** Issues warning to player

#### Moderation Features
- **Format Tags:** Optional categorization (e.g., @hacking, @spam)
- **Reason Tracking:** Optional reason text for audit trail
- **Time Formats:** Supports s/m/h/d/w/mo for duration specification
- **Error Handling:** Graceful handling of offline players and connection issues
- **Integration:** Uses axios for HTTP communication with game server connector

### 5. Content Management

#### Bug Tracking (`modules/bugs/`)
- **postBug(name, content):** Creates new bug reports
- **getBugs():** Retrieves all bug reports
- **deleteBug(name):** Removes bug reports
- **Storage:** Bugs stored with name identifier and description content

#### Player Reports (`modules/reports/`)
- **postReport(player, content):** Creates reports about player behavior
- **getReports():** Retrieves all player reports
- **deletePost(player):** Removes reports
- **Usage:** Used for tracking problematic player behavior

#### News Management (`modules/news/`)
- **writeNews(username, title, content, level):** Creates news articles with priority levels
- **editNews(id, username, title, content, level):** Updates existing articles
- **deleteNews(id, username):** Removes articles
- **getNews():** Retrieves all news articles
- **Priority System:** Level 1-5 for article importance
- **Attribution:** Tracks which staff member created/edited articles
- **Validation:** Input sanitization and length restrictions

#### Suspicions Tracking (`modules/suspections/`)
- **createSuspection(title, description, subject):** Creates suspicious activity reports
- **editSuspection(id, title, description, subject):** Updates suspicion reports
- **deleteSuspection(id):** Removes suspicion reports
- **getSuspections():** Retrieves all suspicions
- **Usage:** Tracks potentially suspicious players or patterns

### 6. Server Management (`modules/server/`)

#### Server Monitoring
- **getServers():** Retrieves status of all game servers
- **getProxyServers():** Gets list of available proxy/lobby servers
- **getLogs(id):** Fetches server log files for troubleshooting
- **Integration:** Communicates with server infrastructure

#### Server Control
- **serverAction(id, action):** Executes administrative actions on servers
- **Actions:** Start, stop, restart, and other server management commands
- **Safety:** Requires specific permissions to prevent unauthorized control

### 7. Internal Messaging (`modules/staff/msg/`)

#### Message Operations
- **sendMessage(username, msg):** Creates internal staff messages
- **getMessages():** Retrieves message history
- **deleteMessage(id):** Removes messages
- **Usage:** Internal communication between staff members
- **Attribution:** Messages tagged with sender username

### 8. Logging System (`modules/middleware/logging.js`)

#### Logging Functionality
The logging system provides comprehensive audit trails for all staff actions.

##### Log Functions
- **logAction(action, targetExtractor):** Middleware for logging specific actions with optional targets
- **logRequest:** Simplified logging for basic requests

##### Log Structure
Each log entry contains:
- **timestamp:** When the action occurred
- **username:** Who performed the action
- **action:** What action was performed
- **target:** Who/what was affected (optional)
- **message:** Full formatted log message
- **endpoint:** API endpoint that was called

##### Logging Behavior
- **Selective Logging:** Only logs POST/PUT/DELETE requests (actions that modify data)
- **No Read Logging:** GET requests are not logged to prevent database bloat
- **Non-Blocking:** Logging failures don't prevent request completion
- **Database Storage:** Logs stored in dedicated `logs` table
- **Console Output:** Logs also written to console for development

##### Log Retrieval
- **Endpoint:** `/api/logs/get` retrieves last 100 logs
- **Ordering:** Newest logs first
- **Access Control:** Requires `logsView` permission

### 9. Database Layer (`modules/db/pool.js`)

#### Connection Management
- **Connection Pooling:** Maintains pool of reusable database connections
- **Configuration:**
  - Host, user, database, and password from environment variables
  - Connection limit: 10 concurrent connections
  - Idle timeout: 60 seconds
  - Keep-alive enabled for connection stability
- **Promise-based:** Uses mysql2/promise for async/await support

### 10. Utility Modules

#### Response Constructor (`modules/vars/constructor.js`)
- **createConstructor(type, status, message, data):** Standardizes API response format
- **Consistent Structure:** All responses follow same format with error/success flags
- **Data Encapsulation:** Wraps response data in standardized envelope

#### Error Messages (`modules/vars/error/`)
Predefined error objects for common scenarios:
- Missing required parameters
- Authentication failures
- Permission denials
- Internal server errors
- Invalid inputs

#### Success Messages (`modules/vars/success/`)
Predefined success objects for common operations:
- User creation/retrieval
- Login success
- Data retrieval confirmations
- Operation completions

## Middleware Pipeline

### Request Flow
```
1. Request → Express Server
2. Body Parser (JSON)
3. CORS Headers
4. Authentication Check (authenticateToken)
5. Permission Check (checkPerms)
6. Action Logging (logAction) [if POST/PUT/DELETE]
7. Route Handler
8. Response
```

### Middleware Components

#### 1. Authentication Middleware (`authenticateToken`)
- Extracts JWT token from Authorization header
- Verifies token signature and expiration
- Attaches user information to request object
- Rejects invalid/missing tokens with 401/403

#### 2. Permission Middleware (`checkPerms`)
- Checks if authenticated user has required permission
- Queries database for user's role and permissions
- Allows access if permission matches or "all" permission exists
- Rejects unauthorized access with 403

#### 3. Logging Middleware (`logAction`)
- Logs actions that modify data (POST/PUT/DELETE)
- Extracts user, action, and target information
- Writes to database logs table
- Non-blocking - continues even if logging fails

#### 4. Validation Middleware (`express-validator`)
- Sanitizes and validates input data
- Prevents XSS and injection attacks
- Enforces length and type constraints
- Used on sensitive endpoints (news, user creation)

## Security Features

### 1. Authentication Security
- **JWT Tokens:** Stateless authentication with configurable expiration
- **Bearer Token Format:** Standard Authorization header implementation
- **Token Secrets:** Stored in environment variables, never in code

### 2. Password Security
- **bcrypt Hashing:** Industry-standard password hashing
- **Salt Rounds:** Configurable salt rounds for hash strength
- **No Plaintext Storage:** Passwords never stored in readable form

### 3. Authorization Security
- **Role-Based Access:** Granular permission control
- **Least Privilege:** Each action requires specific permission
- **Permission Checking:** Every protected route validates permissions

### 4. Input Security
- **Validation:** express-validator sanitizes and validates inputs
- **Escaping:** HTML/script tags escaped to prevent XSS
- **Length Limits:** Maximum lengths enforced on text inputs
- **Type Checking:** Data types validated before processing

### 5. Logging Security
- **Audit Trail:** All actions logged with user attribution
- **Immutability:** Logs cannot be edited through API
- **Access Control:** Log viewing requires specific permission
- **Timestamp Tracking:** Precise time tracking for all actions

### 6. Database Security
- **Parameterized Queries:** Protection against SQL injection
- **Connection Pooling:** Efficient and secure connection management
- **Environment Variables:** Credentials stored outside codebase

### 7. API Security
- **CORS:** Configured for controlled cross-origin access
- **Error Handling:** Generic error messages prevent information leakage
- **Timeout Configuration:** Prevents hanging connections
- **Rate Limiting:** (Recommended for production deployment)

## Environment Configuration

### Required Environment Variables
```
# Database Configuration
DB_HOST=<database_host>
DB_USER=<database_user>
DB=<database_name>
DB_PASSWORD=<database_password>

# JWT Configuration
ACCESS_TOKEN=<jwt_secret_key>

# API Response Types
SUCCESS_VAR=<success_identifier>
ERROR_VAR=<error_identifier>

# External Connector (for player/moderation actions)
CONNECTOR_IP=<connector_host_with_protocol>
CONNECTOR_PORT=<connector_port>

# Server Configuration
PORT=<server_port> (optional, defaults to 3000)
```

## Database Schema

### Required Tables

#### users
- User authentication and profile data
- Columns: id, name, password (hashed), permissions (role name), ign

#### roles
- Permission role definitions
- Columns: id, name, perms (JSON array)

#### logs
- Action audit trail
- Columns: id, timestamp, username, action, target, message, endpoint, created_at

#### bugs
- Bug tracking
- Columns: id, name, content, created_at

#### reports
- Player reports
- Columns: id, player, content, created_at

#### news
- News articles
- Columns: id, author, title, content, level, created_at, updated_at

#### suspections
- Suspicious activity tracking
- Columns: id, title, description, subject, created_at

#### messages
- Internal staff messages
- Columns: id, sender, msg, timestamp

## External Integrations

### Java Game Server Connector
The system integrates with an external Java-based connector API for real-time game server interaction.

#### Integration Points
- **Player Data:** Retrieves live player information
- **Player Actions:** Moves players between servers
- **Moderation Commands:** Executes kick/ban/warn commands
- **Server Data:** Fetches server and proxy server lists

#### Communication
- **Protocol:** HTTP/HTTPS
- **Format:** JSON
- **Library:** axios for HTTP requests
- **Error Handling:** Graceful degradation on connector unavailability
- **Timeout:** 10-second timeout on all requests

#### Connector Endpoints Used
- `/api/get/players` - Live player data
- `/api/get/player/:name` - Individual player info
- `/api/post/sendPlayer/:name` - Move player to server
- `/api/action/kick` - Kick player
- `/api/action/ban` - Ban player
- `/api/action/tempban` - Temporary ban
- `/api/action/warn` - Warn player

## API Response Format

### Standard Response Structure
All API responses follow a consistent format for predictability and ease of client-side handling.

```javascript
{
  error: boolean,           // true if error occurred
  success: boolean,         // true if operation succeeded
  status: number,           // HTTP status code
  main: {
    msg: string,           // Human-readable message
    time: string,          // ISO timestamp
    endpoint: string,      // Request endpoint
    data: object|array     // Response payload (optional)
  }
}
```

### Response Types
- **Success Responses:** error=false, success=true, status=200
- **Client Errors:** error=true, success=false, status=400
- **Authentication Errors:** error=true, success=false, status=401/403
- **Server Errors:** error=true, success=false, status=500

## Error Handling

### Error Types
1. **Validation Errors:** Missing or invalid input parameters
2. **Authentication Errors:** Missing or invalid tokens
3. **Authorization Errors:** Insufficient permissions
4. **Database Errors:** Connection or query failures
5. **External API Errors:** Connector unavailable or timeout
6. **Server Errors:** Unexpected exceptions

### Error Handling Strategy
- **Try-Catch Blocks:** All async operations wrapped in error handlers
- **Graceful Degradation:** Logging failures don't block requests
- **Error Logging:** Console logging for debugging
- **Generic Messages:** Don't expose internal details to clients
- **Status Codes:** Appropriate HTTP status codes for each error type

## Performance Considerations

### Database Optimization
- **Connection Pooling:** Reuses connections for efficiency
- **Indexed Columns:** Logs table indexed on username, timestamp, action, endpoint
- **Query Limits:** Logs limited to 100 most recent entries
- **Prepared Statements:** Parameterized queries prevent reparsing

### Caching Strategy
- **Stateless Design:** JWT authentication enables horizontal scaling
- **No Session Storage:** Reduces memory footprint
- **Database Connection Reuse:** Pool maintains hot connections

### Scalability Features
- **Stateless API:** Can run multiple instances behind load balancer
- **JWT Authentication:** No server-side session storage required
- **Database Pooling:** Handles concurrent requests efficiently
- **Async/Await:** Non-blocking I/O throughout application

## Frontend Integration

### React Dashboard
The system includes a complete React-based staff dashboard for visual management.

#### Dashboard Features
- **User Management:** Create, view, and delete staff users
- **Role Management:** Define and assign permission roles
- **Player Monitoring:** View live players, send to servers
- **Moderation Interface:** Kick, ban, warn players with popup dialogs
- **Content Management:** Create/edit news, track bugs, handle reports
- **Activity Logs:** Search and filter all staff actions
- **Auto-Refresh:** Data updates every 10 seconds automatically

#### Frontend Technology
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Validation:** Built-in form validation

#### Frontend-Backend Communication
- **REST API:** All communication via HTTP API endpoints
- **Authentication:** JWT tokens in Authorization header
- **CORS:** Enabled for cross-origin requests
- **Static Serving:** Built React app served from /public/staff/dist

## Development Workflow

### Project Setup
1. Install dependencies: `npm install`
2. Configure `.env` file with required variables
3. Initialize database with required tables
4. Run server: `node server.js`

### Frontend Development
1. Navigate to `public/staff`
2. Install dependencies: `npm install`
3. Development: `npm run dev`
4. Production build: `npm run build`

### Code Organization
- **Modular Design:** Each feature in separate module
- **DRY Principle:** Shared utilities in vars/ directory
- **Middleware Pattern:** Reusable request processing
- **Consistent Naming:** Clear, descriptive function names

## Deployment Considerations

### Production Checklist
- [ ] Set strong JWT secret (ACCESS_TOKEN)
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS for production
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Implement rate limiting
- [ ] Enable compression middleware
- [ ] Configure logging to files (not just console)
- [ ] Set up process manager (PM2, systemd)
- [ ] Monitor server health and performance
- [ ] Implement log rotation for database logs
- [ ] Review and harden security settings

### Recommended Production Enhancements
- **Rate Limiting:** Prevent API abuse
- **Request Logging:** morgan or similar
- **Error Tracking:** Sentry or similar service
- **Health Checks:** /health endpoint for monitoring
- **Graceful Shutdown:** Handle SIGTERM/SIGINT properly
- **Clustering:** Run multiple Node.js processes
- **Reverse Proxy:** nginx or similar in front
- **SSL/TLS:** HTTPS encryption
- **Database Replication:** High availability
- **Monitoring:** Application performance monitoring

## Key Design Principles

### 1. Separation of Concerns
- Routes define endpoints, modules handle logic
- Database access separated into dedicated modules
- Middleware handles cross-cutting concerns

### 2. Security First
- Authentication required on all protected routes
- Permission checks before any data modification
- Input validation and sanitization
- Comprehensive audit logging

### 3. Consistency
- Standard response format across all endpoints
- Consistent error handling patterns
- Uniform naming conventions

### 4. Maintainability
- Modular code organization
- Clear function responsibilities
- Comprehensive logging for debugging
- Documentation in code comments

### 5. Scalability
- Stateless design enables horizontal scaling
- Database connection pooling
- Async/await for non-blocking operations
- Efficient data structures

## System Limitations

### Current Constraints
- **Log Storage:** Logs grow indefinitely without rotation
- **Log Retrieval:** Limited to 100 most recent logs
- **Single Database:** No replication or failover
- **No Caching:** All requests hit database
- **Rate Limiting:** Not implemented
- **File Uploads:** Limited support for attachments
- **Real-time Updates:** Requires client polling (10s intervals)
- **Session Management:** Tokens don't automatically expire client-side

### Known Issues
- **Log Table Growth:** Consider implementing log archival
- **Permission Granularity:** Single permission per action (no hierarchical permissions)
- **Error Messages:** Some generic messages could be more specific
- **Input Validation:** Not all endpoints have comprehensive validation

## Future Enhancement Opportunities

### Potential Improvements
1. **WebSocket Integration:** Real-time updates instead of polling
2. **Advanced Search:** Full-text search on logs and content
3. **Export Features:** Export logs, reports, bugs to CSV/JSON
4. **Pagination:** Proper pagination for large datasets
5. **Filtering:** Advanced filtering options on list endpoints
6. **Batch Operations:** Bulk moderation actions
7. **Analytics Dashboard:** Statistics and charts
8. **Notification System:** Alerts for important events
9. **Two-Factor Authentication:** Enhanced security
10. **API Documentation:** Auto-generated API docs (Swagger/OpenAPI)
11. **GraphQL Endpoint:** Alternative to REST API
12. **Microservices:** Split into smaller, focused services

## Troubleshooting Guide

### Common Issues

#### Authentication Failures
- **Symptom:** 401/403 errors on protected routes
- **Causes:** Invalid token, expired token, missing Authorization header
- **Solutions:** Check token format, verify ACCESS_TOKEN secret, ensure token hasn't expired

#### Permission Denied
- **Symptom:** 403 errors even with valid authentication
- **Causes:** User lacks required permission, role not properly configured
- **Solutions:** Check user's role has required permission, verify permission names match

#### Database Connection Issues
- **Symptom:** 500 errors, "Cannot connect to database"
- **Causes:** Wrong credentials, database server down, connection limit reached
- **Solutions:** Verify DB_* environment variables, check database server status, review connection pool settings

#### Moderation Actions Fail
- **Symptom:** Moderation commands return errors
- **Causes:** Player not online, connector unavailable, network issues
- **Solutions:** Verify CONNECTOR_IP/PORT, check connector service status, ensure player is online

#### Logging Not Working
- **Symptom:** No logs appearing in database
- **Causes:** Logs table doesn't exist, database permission issues
- **Solutions:** Run logs_table.sql, verify database user has INSERT permissions

## Conclusion

The GamingBlock Internal Management System provides a comprehensive, secure, and scalable solution for managing a Minecraft server network. Its modular architecture, robust security features, and extensive audit logging make it suitable for production deployment while remaining maintainable and extensible for future enhancements.

The system successfully integrates staff management, player moderation, content management, and server administration into a single cohesive platform, with a modern React frontend providing an intuitive user interface for all management tasks.
