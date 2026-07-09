# DeployPilot - Module 2: Dashboard, Login & Core Layout

This document records the design implementation of the Login page, Shared Sidebar Shell, and Dashboard metrics/charts.

---

## 1. Authentication Page

Implemented in `frontend/app/login/page.tsx`:
- **UI Design**: A modern dark authentication login gate with custom CSS keyframe animations.
- **Client Validation**: Utilizes `react-hook-form` coupled with the `@hookform/resolvers/zod` bridge and `zod` schema to validate email formatting and password lengths before submitting.
- **Mock Actions**: Simulates an active backend authentication request with loading indicator spinners before redirecting to the main dashboard.

---

## 2. Shared Shell Layout

The control panel pages share a common shell layout.

### Collapsible Sidebar (`frontend/components/sidebar.tsx`)
- Fits seamlessly on desktop, featuring a toggle click trigger to expand or collapse.
- Provides icon triggers (`lucide-react`) for:
  1. **Dashboard Overview** (`/dashboard`)
  2. **Deploy Application** (`/dashboard/deploy`)
  3. **Workloads List** (`/dashboard/applications`)
  4. **Cluster Monitor** (`/dashboard/cluster`)
  5. **Settings Panel** (`/dashboard/settings`)
- Displays active route highlights and shows custom tooltip overlays for icons when in collapsed state.
- Embeds admin session branding details and a "Sign Out" route link.

### Dashboard Layout Wrapper (`frontend/app/dashboard/layout.tsx`)
- Orchestrates the sidebar layout.
- Provides a clean top navigation bar displaying active Kubernetes context (`minikube/default`), backend health heartbeat signals, and mobile responsive sandwich menu options.

---

## 3. Metrics Cards & Interactive Graphs

Implemented in `frontend/app/dashboard/page.tsx` using **React Server/Client hydration**:
- **Workload Status**: Collects live deployment details from `/deployments` and `/cluster` using `@tanstack/react-query` to count running/failed states.
- **System Gauges**: Renders responsive HTML5 progress meters representing CPU and Memory allocations.
- **Interactive SVG Charts**:
  - **Recent Deployments**: A vertical bar chart indicating deployment success frequency per weekday.
  - **Success Rate Gauge**: A radial circle ring mapping completed rollouts vs rollout errors.
  - **Cluster Utilization**: A dual-layered transparent area graph displaying CPU and Memory curves.
- **Graceful Fallbacks**: Includes pre-populated high-fidelity default visuals if the backend API is unreachable.

---

## 4. Verification

The Next.js build compiled successfully:
```bash
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /dashboard
└ ○ /login

○  (Static)  prerendered as static content
```
The views are ready to receive states for deployment orchestration.
