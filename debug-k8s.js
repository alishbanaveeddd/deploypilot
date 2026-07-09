const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "k8s-debug-report.log");
let report = `======================================================================
DEPLOYPILOT KUBERNETES DIAGNOSTIC REPORT
Generated at: ${new Date().toISOString()}
======================================================================\n\n`;

function runCmd(title, cmd) {
    report += `----------------------------------------------------------------------
> ${title} (${cmd})
----------------------------------------------------------------------\n`;
    try {
        const output = execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
        report += output + "\n";
    } catch (err) {
        report += `CMD FAILED: ${err.message}\n`;
        if (err.stdout) report += `Stdout:\n${err.stdout}\n`;
        if (err.stderr) report += `Stderr:\n${err.stderr}\n`;
    }
    report += "\n";
}

console.log("Generating Kubernetes diagnostics report...");

runCmd("Minikube Status", "minikube status");
runCmd("Current Kubernetes Config Context", "kubectl config current-context");
runCmd("Cluster General Info", "kubectl cluster-info");
runCmd("Active Nodes Details", "kubectl get nodes -o wide");
runCmd("Deployments (All Namespaces)", "kubectl get deployments -A");
runCmd("Pod Instances Status (Default Namespace)", "kubectl get pods -o wide");
runCmd("Pod Details Descriptions (kubectl describe pods)", "kubectl describe pods");
runCmd("Recent Kubernetes Event Logs (Default Namespace)", "kubectl get events --sort-by=.metadata.creationTimestamp -n default");
runCmd("Docker Images Cache loaded in Minikube", "minikube image list");

fs.writeFileSync(logFile, report, "utf8");
console.log(`Diagnostic report successfully generated at: ${logFile}`);
