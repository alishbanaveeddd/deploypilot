const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

const { execSync } = require("child_process");
const git = simpleGit();

function rmDirWithRetry(dirPath, retries = 5, delay = 200) {
    if (!fs.existsSync(dirPath)) return;
    for (let i = 0; i < retries; i++) {
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            return;
        } catch (err) {
            if (i === retries - 1) throw err;
            try {
                execSync(`powershell -Command "Start-Sleep -Milliseconds ${delay}"`);
            } catch (e) {
                // Fallback sleep loop
                const start = Date.now();
                while (Date.now() - start < delay) {}
            }
        }
    }
}

async function cloneRepository(repoUrl, appName, branch = "main", onLog = console.log) {
    const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const repoPath = path.join(__dirname, "..", "repos", `${appName}-${uniqueSuffix}`);

    onLog(`[Git] Cloning repository ${repoUrl} (branch: ${branch}) to temporary folder...`);

    // Try to clone specific branch
    try {
        const options = ["-b", branch];
        await git.clone(repoUrl, repoPath, options);
        onLog(`[Git] Branch "${branch}" cloned successfully.`);
    } catch (err) {
        onLog(`[Git Warning] Specified branch "${branch}" clone failed. Error: ${err.message}`);
        onLog(`[Git] Cleaning up and falling back to default branch clone...`);
        // Clean up partial folder if it exists
        rmDirWithRetry(repoPath);
        // Fallback to clone default branch (e.g., master/main)
        await git.clone(repoUrl, repoPath);
        onLog(`[Git] Default branch cloned successfully.`);
    }

    return repoPath;
}

module.exports = {
    cloneRepository
};