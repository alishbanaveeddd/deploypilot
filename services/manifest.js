const fs = require("fs");
const path = require("path");

function generateDeployment(appName, imageName, config = {}) {
    const replicas = config.replicas !== undefined ? config.replicas : 1;
    const containerPort = config.containerPort !== undefined ? config.containerPort : 3000;
    const namespace = config.namespace || "default";
    
    // CPU/Memory limits
    const cpuLimit = config.resources?.cpuLimit || "500m";
    const memoryLimit = config.resources?.memoryLimit || "512Mi";
    const cpuRequest = config.resources?.cpuRequest || "100m";
    const memoryRequest = config.resources?.memoryRequest || "128Mi";
    
    const env = config.env || [];
    const healthCheckPath = config.healthCheck?.path || "";

    // Generate environment variables section
    let envSection = "";
    if (env.length > 0) {
        envSection = "\n        env:\n" + env.map(e => `        - name: ${e.name}\n          value: "${e.value}"`).join("\n");
    }

    // Generate probe section if path exists
    let probeSection = "";
    if (healthCheckPath) {
        probeSection = `\n        livenessProbe:
          httpGet:
            path: ${healthCheckPath}
            port: ${containerPort}
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: ${healthCheckPath}
            port: ${containerPort}
          initialDelaySeconds: 10
          periodSeconds: 10`;
    }

    const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}
  namespace: ${namespace}
  labels:
    app: ${appName}
    managed-by: deploypilot
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
      - name: ${appName}
        image: ${imageName}
        imagePullPolicy: Never
        ports:
        - containerPort: ${containerPort}${envSection}${probeSection}
        resources:
          limits:
            cpu: "${cpuLimit}"
            memory: "${memoryLimit}"
          requests:
            cpu: "${cpuRequest}"
            memory: "${memoryRequest}"
`;

    const filePath = path.join(
        __dirname,
        "..",
        "generated",
        `${appName}-deployment.yaml`
    );

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, deployment);

    return filePath;
}

function generateService(appName, servicePort = 80, containerPort = 3000, namespace = "default") {
    const service = `apiVersion: v1
kind: Service
metadata:
  name: ${appName}-service
  namespace: ${namespace}
  labels:
    app: ${appName}
    managed-by: deploypilot
spec:
  selector:
    app: ${appName}
  ports:
    - port: ${servicePort}
      targetPort: ${containerPort}
  type: NodePort
`;

    const filePath = path.join(
        __dirname,
        "..",
        "generated",
        `${appName}-service.yaml`
    );

    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, service);

    return filePath;
}

module.exports = {
    generateDeployment,
    generateService
};