# DeployPilot - Module 6: Backend Service Enhancements & Dynamic Kubernetes Manifests

This document logs the core REST APIs, CORS updates, dynamic manifest generation specs, and cluster interaction models programmed in Module 6.

---

## 1. Express Router & CORS (`index.js`)

- **CORS Handling**: Injected inline CORS middleware allowing all standard cross-origin headers, methods (GET, POST, PUT, DELETE, OPTIONS), and credentials from the frontend port `3001`.
- **API Registry**:
  - `POST /deploy` — Clones repository, builds containers, and applies specs.
  - `GET /deployments` — Outputs simplified JSON mapping active app statuses.
  - `GET /deployments/:name` — Aggregates pod details, events registries, ConfigMap variables, namespace context parameters, limits, and spec manifests.
  - `DELETE /deployments/:name` — Deletes Deployment controller and associated Service proxy.
  - `POST /deployments/:name/restart` — Triggers rollout restart command.
  - `POST /deployments/:name/scale` — Modifies replica count metrics.
  - `GET /deployments/:name/logs` — Reads stdout lines of all containers in matching selector tags.
  - `GET /cluster` — Resolves node diagnostics, namespaces, and CPU/Memory gauges.
  - `GET /health` — Diagnostic responder.

---

## 2. Advanced Spec Generator (`services/manifest.js`)

Upgraded the YAML builders to output:
- **Dynamic Replicas**: Binds spec counts from form configuration inputs.
- **Compute Resources**: Configures limits and requests for CPU and Memory blocks.
- **Environment Variables**: Dynamically maps key-value array parameters into standard Container environment variables blocks.
- **Health check Probes**: Dynamically injects `livenessProbe` and `readinessProbe` HTTP GET hooks with initial startup delays if endpoint path is specified.
- **Networking**: Maps node ports, selector tags, and target container ports in the Service resource manifest.

---

## 3. Kubernetes Orchestrator (`services/kubernetes.js`)

Constructed robust exec utility functions wrapping standard K8s operations:
- `kubectl apply -f [file]`
- `kubectl delete deployment [name]`
- `kubectl delete service [name]-service`
- `kubectl rollout restart deployment [name]`
- `kubectl scale deployment [name] --replicas=[count]`
- `kubectl logs -l app=[name] --all-containers=true --tail=500`
- `kubectl top nodes` (with fallback logic based on deployment scale if metrics-server is missing)

---

## 4. Verification

The server starts up and successfully binds to port `3000`:
```bash
Registering routes...
Deploy Pilot server listening on port 3000
```
Verified connection probe using fetch:
```javascript
{ status: 'UP', timestamp: '2026-07-08T14:55:23.391Z' }
```
CORS headers and JSON parser are verified active.
