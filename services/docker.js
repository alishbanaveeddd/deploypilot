const { spawn } = require("child_process");

function buildImage(repoPath, appName, onLog = console.log) {
    return new Promise((resolve, reject) => {
        const imageName = `${appName}:latest`;
        const args = ["build", "-t", imageName, repoPath];

        onLog(`[Docker] Starting build: docker ${args.join(" ")}`);
        
        const child = spawn("docker", args);

        child.stdout.on("data", (data) => {
            const lines = data.toString().split("\n");
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed) onLog(trimmed);
            });
        });

        child.stderr.on("data", (data) => {
            const lines = data.toString().split("\n");
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed) onLog(`[Docker Error] ${trimmed}`);
            });
        });

        child.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`Docker build failed with exit code ${code}`));
                return;
            }

            onLog(`[Docker] Image ${imageName} built successfully.`);
            onLog(`[Docker] Loading image ${imageName} into Minikube cache...`);

            const mkChild = spawn("minikube", ["image", "load", imageName]);

            mkChild.stdout.on("data", (data) => {
                const lines = data.toString().split("\n");
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed) onLog(`[Minikube] ${trimmed}`);
                });
            });

            mkChild.stderr.on("data", (data) => {
                const lines = data.toString().split("\n");
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed) onLog(`[Minikube Error] ${trimmed}`);
                });
            });

            mkChild.on("close", (mkCode) => {
                if (mkCode !== 0) {
                    onLog(`[Docker] WARNING: Minikube image load failed with code ${mkCode}. Rollout might fallback to cluster pull.`);
                } else {
                    onLog(`[Docker] Image loaded successfully into Minikube.`);
                }
                resolve(imageName);
            });
        });
    });
}

module.exports = {
    buildImage,
};