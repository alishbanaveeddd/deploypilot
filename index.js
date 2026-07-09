const express = require("express");
const crypto = require("crypto");

const { initDb, authenticateUser, createUser } = require("./services/db");
const { cloneRepository } = require("./services/git");
const { buildImage } = require("./services/docker");
const {
    deploy,
    watchDeploymentRollout,
    getDeployments,
    getDeploymentStatus,
    deleteDeployment,
    restartDeployment,
    scaleDeployment,
    getDeploymentLogs,
    getClusterStatus
} = require("./services/kubernetes");
const {
    generateDeployment,
    generateService
} = require("./services/manifest");

const app = express();

// Simple, dependency-free CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Namespace");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

// Extract namespace from headers for kubectl operations
app.use((req, res, next) => {
    req.namespace = req.headers['x-namespace'] || 'default';
    next();
});

// Authentication REST endpoints
app.post("/login", (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = authenticateUser(email, password);
        const token = "auth-token-" + crypto.randomBytes(16).toString("hex");
        res.json({
            success: true,
            user,
            token
        });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

app.post("/register", (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = createUser(email, password, name);
        res.json({
            success: true,
            user
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Enhanced Deploy Application endpoint
app.post("/deploy", async (req, res) => {
    // Set headers for streaming logs back to client
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const onLog = (msg) => {
        res.write(msg + "\n");
    };

    try {
        const { 
            repoUrl, 
            appName, 
            branch = "main", 
            replicas = 1,
            containerPort = 3000,
            servicePort = 80,
            resources = {},
            env = [],
            healthCheck = null,
            namespace = req.namespace || "default"
        } = req.body;

        if (!repoUrl || !appName) {
            onLog("[ERROR] repoUrl and appName are required.");
            res.status(400).end();
            return;
        }

        onLog(`[DeployPilot] Initiating deployment for app: ${appName} in namespace: ${namespace}`);
        
        const repoPath = await cloneRepository(repoUrl, appName, branch, onLog);

        onLog(`[DeployPilot] Compiling Docker image...`);
        const imageName = await buildImage(repoPath, appName, onLog);

        // Clean up temporary repo folder after docker build completes
        try {
            const fs = require("fs");
            if (fs.existsSync(repoPath)) {
                fs.rmSync(repoPath, { recursive: true, force: true });
                onLog(`[DeployPilot] Temporary source workspace cleaned.`);
            }
        } catch (e) {
            onLog(`[DeployPilot Warning] Temp directory clean warning: ${e.message}`);
        }

        onLog(`[DeployPilot] Generating Kubernetes manifests specs...`);
        const deploymentFile = generateDeployment(appName, imageName, {
            replicas,
            containerPort,
            resources,
            env,
            healthCheck,
            namespace
        });

        const serviceFile = generateService(appName, servicePort, containerPort, namespace);

        onLog(`[DeployPilot] Applying config manifests to cluster...`);
        await deploy(deploymentFile, namespace, onLog);
        await deploy(serviceFile, namespace, onLog);

        // Watch deployment container rollout progress
        await watchDeploymentRollout(appName, namespace, onLog);

        onLog(`[SUCCESS] Workload is live on the cluster!`);
        onLog(`[SUCCESS] Mapped endpoint: ${appName}-service`);
        res.end();

    } catch (err) {
        onLog(`[ERROR] Deployment pipeline failed: ${err.message}`);
        res.end();
    }
});


// Simplified Deployments List endpoint
app.get("/deployments", (req, res) => {
    try {
        const list = getDeployments(req.namespace);
        res.json(list);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Detailed Workload Status endpoint
app.get("/deployments/:name", (req, res) => {
    try {
        const details = getDeploymentStatus(req.params.name, req.namespace);
        res.json(details);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Tear down Deployment, ReplicaSet, and Service
app.delete("/deployments/:name", (req, res) => {
    try {
        const result = deleteDeployment(req.params.name, req.namespace);
        res.json(result);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Rollout Restart endpoint
app.post("/deployments/:name/restart", (req, res) => {
    try {
        const result = restartDeployment(req.params.name, req.namespace);
        res.json(result);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Scale replicas endpoint
app.post("/deployments/:name/scale", (req, res) => {
    try {
        const { replicas } = req.body;
        if (replicas === undefined) {
            return res.status(400).json({
                error: "replicas count value is required in request body"
            });
        }
        const result = scaleDeployment(req.params.name, replicas, req.namespace);
        res.json(result);
    } catch (err) {
        res.status(550).json({
            error: err.message
        });
    }
});

// Pod logs endpoint
app.get("/deployments/:name/logs", (req, res) => {
    try {
        const logs = getDeploymentLogs(req.params.name, req.namespace);
        res.json(logs);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Cluster Telemetry endpoint
app.get("/cluster", (req, res) => {
    try {
        const status = getClusterStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Heartbeat probe endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        timestamp: new Date().toISOString()
    });
});

console.log("Registering routes...");
initDb();
app.listen(3000, () => {
    console.log("Deploy Pilot server listening on port 3000");
});
