const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dbDir = path.join(__dirname, "..", "data");
const dbFile = path.join(dbDir, "users.json");

// Hash password with SHA256
function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// Ensure database file exists with seed data
function initDb() {
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(dbFile)) {
        // Seed default administrator
        const defaultAdmin = {
            id: "admin-uuid-001",
            name: "Pilot Admin",
            email: "admin@deploypilot.com",
            password: hashPassword("password123"),
            createdAt: new Date().toISOString()
        };
        fs.writeFileSync(dbFile, JSON.stringify([defaultAdmin], null, 4), "utf8");
        console.log("[Database] Database initialized with default admin.");
    }
}

// Retrieve users array
function getUsers() {
    initDb();
    try {
        const content = fs.readFileSync(dbFile, "utf8");
        return JSON.parse(content);
    } catch (e) {
        console.error("[Database] Error reading users database:", e.message);
        return [];
    }
}

// Save users array
function saveUsers(users) {
    try {
        fs.writeFileSync(dbFile, JSON.stringify(users, null, 4), "utf8");
    } catch (e) {
        console.error("[Database] Error writing to users database:", e.message);
    }
}

// Create new user account
function createUser(email, password, name) {
    const users = getUsers();
    
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("User with this email already exists.");
    }

    const newUser = {
        id: crypto.randomUUID(),
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: hashPassword(password),
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

// Authenticate user credentials
function authenticateUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        throw new Error("Invalid credentials. User not found.");
    }

    const hashedInput = hashPassword(password);
    if (user.password !== hashedInput) {
        throw new Error("Invalid credentials. Incorrect password.");
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
}

module.exports = {
    initDb,
    createUser,
    authenticateUser,
    getUsers
};
