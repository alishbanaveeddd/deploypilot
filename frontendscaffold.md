# DeployPilot - Module 1: Frontend Scaffold

This document outlines the architecture, layout structure, packages, configurations, and themes created for the Next.js frontend of DeployPilot.

---

## 1. Directory Structure

The Next.js 15 application is scaffolded in the `frontend/` directory with the following structure matching the target specification:

```
frontend/
├── app/                  # Next.js App Router folders & pages
│   ├── globals.css       # Tailwind CSS variables and theme configuration
│   ├── layout.tsx        # App layout with global providers and font configuration
│   └── page.tsx          # DeployPilot premium landing / console gate page
├── components/           # Reusable UI component libraries
│   ├── ui/               # Core low-level Shadcn UI primitives
│   │   └── button.tsx    # Shadcn Button component
│   └── providers.tsx     # TanStack Query query clients setup
├── hooks/                # Custom React Hooks
├── lib/                  # Utility libraries and integrations
│   └── utils.ts          # CN class merge helpers
├── services/             # API layer connection utilities
│   └── api.ts            # Client interface for Express endpoints
└── types/                # Core TypeScript types & definitions
    └── index.ts          # Deployments & Kubernetes models
```

---

## 2. Core Dependencies & Packages

We've installed the following technologies to form the foundation of our client application:
- **UI & Icons**: `lucide-react` for modern icon components.
- **Client Queries**: `@tanstack/react-query` to handle cache management, request invalidation, and auto-refresh states for deployments.
- **Form Handling & Validation**: `react-hook-form` coupled with `@hookform/resolvers` and `zod` for robust client-side validation of deployment manifests.

---

## 3. Styling & Dark Theme

The project is built on **Tailwind CSS v4** utilizing standard CSS variables mapped to design tokens in `frontend/app/globals.css`. 

- **Dark Mode**: Configured to run in dark mode by default. The parent layout injects `.dark` class dynamically.
- **Colors**: Leverages OKLCH space (e.g. `slate-950` backgrounds, `indigo-600` primary highlights) giving it a premium, modern SaaS feel.

---

## 4. API Client Integration

Inside `frontend/services/api.ts`, a fully typed Axios-like API wrapper has been implemented mapping all upcoming endpoints:
- `POST /deploy` (Clones, builds, and deploys applications)
- `GET /deployments` (Lists active configurations)
- `GET /deployments/:name` (Details status, events, and pod instances)
- `DELETE /deployments/:name` (Tears down pods, replica sets, and services)
- `POST /deployments/:name/restart` (Rollout restarts)
- `POST /deployments/:name/scale` (Scales replicaset counts)
- `GET /deployments/:name/logs` (Pulls stdout log streams)
- `GET /cluster` (Retrieves orchestrator stats: node CPU, memory metrics, healthy states)

---

## 5. Verification & Compilation

The project has been tested to build successfully. Output of `npm run build`:
```bash
▲ Next.js 16.2.10 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 6.3s
  Running TypeScript ...
  Finished TypeScript in 6.6s ...
  Collecting page data using 5 workers ...
  Generating static pages using 5 workers (0/4) ...
✓ Generating static pages using 5 workers (4/4) in 2.1s
```
All routes are verified as static and ready to be connected to dynamic React hooks and state.
