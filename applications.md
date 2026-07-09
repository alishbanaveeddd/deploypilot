# DeployPilot - Module 4: Applications List, Details & Logs UI

This document details the layout structure, client side search/filter mechanics, tabbed workloads inspector interfaces, and live logs terminal window created in Module 4.

---

## 1. Applications Registry (`frontend/app/dashboard/applications/page.tsx`)

A unified list dashboard showing all active Kubernetes workloads.

### Features
- **Search & Status Filters**: Instantly filters workloads using client-side search indexing and status filters (All, Running, Pending, Failed).
- **Workloads Grid**: Renders application metadata including ready vs target replica counts, container image tags, and creation dates.
- **Action Control Drawer**:
  - **Details**: Navigates to the specs inspector (`/dashboard/applications/[name]`).
  - **Logs**: Opens the container console logs window (`/dashboard/applications/[name]/logs`).
  - **Scale**: Triggers the interactive scale replicas dialog (1 to 20 range).
  - **Restart**: Dispatches a rollout restart API call with a toast confirmation notification.
  - **Delete**: Prompts a safety warning card confirming deletion of deployment and associated services.

---

## 2. Specs Inspector (`frontend/app/dashboard/applications/[name]/page.tsx`)

A tabbed interface displaying details of a specific deployment workload:

### Tabs
1. **Overview & Config**:
   - Lists target namespaces, ports, cluster IPs, and creation dates.
   - Shows active environment variables loaded from Kubernetes ConfigMap configurations.
   - Displays CPU/Memory requests/limits and liveness/readiness probe path specifications.
2. **Pods & Events**:
   - Inspects status, IP, node, age, and restart history of all active Pod instances.
   - Outputs a system log feed of Kubernetes Events (e.g. Scheduled, Pulling, Pulled, Warning events).
3. **YAML Manifests**:
   - Visualises dynamically generated YAML specs for Deployment and Service assets.
   - Copy-to-clipboard actions with checkmarks for rapid specs inspection.

---

## 3. Logs Terminal UI (`frontend/app/dashboard/applications/[name]/logs/page.tsx`)

A dark container console logs stream viewer:
- **Streaming controls**: A toggle switch for live polling updates (running at 4s loops) and scroll-lock (auto scroll to bottom).
- **Search filtering**: Live client-side regex filter for search queries inside the log stream.
- **Data handling**: One-click Copy logs and Download logs buttons.
- **Color styling**: Employs terminal styling with color highlights for errors (red), command lines (indigo), system traces (indigo), and logs (slate).

---

## 4. Verification

The routes compile cleanly:
```bash
Route (app)
├ ○ /dashboard/applications
├ ƒ /dashboard/applications/[name]
└ ƒ /dashboard/applications/[name]/logs

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```
Zero build errors or warnings.
