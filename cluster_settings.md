# DeployPilot - Module 5: Cluster Monitor & Settings Page

This document details the configuration forms, node registries, namespace tag decks, and capacity meters created in Module 5.

---

## 1. Cluster Monitor Page (`frontend/app/dashboard/cluster/page.tsx`)

A diagnostic panel monitoring Kubernetes cluster wellness:

### Key Sections

| Section | Description |
|---|---|
| **Overview Grid** | Renders cards indicating Cluster Health (e.g. `Healthy`), active Pod count, active Deployments, and active Services. |
| **Capacity Allocation** | Dynamic progress indicators displaying aggregate CPU and Memory demands across all running workload resources. |
| **Node Registry Table** | Outputs node names (e.g. `minikube`), Ready states, controller roles, Kubernetes version, CPU cores, and memory capacity specs. |
| **Namespace Tags** | Renders a tag deck of active namespaces (e.g. `default`, `kube-system`). |

- **State Sync**: Connects to the `/cluster` API route utilizing TanStack Query's `useQuery` query hook (with auto-polling configured at 10-second intervals).

---

## 2. Admin Settings Panel (`frontend/app/dashboard/settings/page.tsx`)

A control deck to manage user sessions and cluster environments:
- **User Profile form**: Manage user display names and emails.
- **Cluster Parameters**: Set backend API URLs and default active namespaces.
- **Appearance Styling**: Toggle user interface themes (dark, light, system theme states).
- **Feedback Alerts**: Prompts save loader indicators and validation feedback banners.

---

## 3. Compilation Verification

Next.js build details:
```bash
Route (app)
├ ○ /dashboard/cluster
└ ○ /dashboard/settings

○  (Static)   prerendered as static content
```
Compilation completed with zero errors or warnings.
