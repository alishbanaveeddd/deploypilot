# DeployPilot - Module 3: Deploy Page & Deployment Progress Modal

This document records the implementation of the Deploy Application form and the real-time animated deployment progress modal.

---

## 1. Deploy Application Form (`frontend/app/dashboard/deploy/page.tsx`)

A production-quality multi-section form organized into five clearly labelled sections:

### Sections

| Section | Fields |
|---|---|
| **Repository** | Repository URL, Application Name, Branch |
| **Scaling & Ports** | Replicas (1–20), Container Port, Service Port |
| **Resource Limits** | CPU Limit (e.g. `250m`), Memory Limit (e.g. `256Mi`) |
| **Environment Variables** | Dynamic key=value pairs with add/remove controls |
| **Health Check** | HTTP probe path (e.g. `/health`) |

### Validation
- Schema defined using **zod v4** with field-level error messages.
- Resolver wired via `@hookform/resolvers/zod` using the `zodResolver` adapter.
- Numeric fields (`replicas`, `containerPort`, `servicePort`) use `{ valueAsNumber: true }` in `register()` — the idiomatic react-hook-form + zod pattern that avoids input type coercion issues.

### Backend Integration
- On valid form submission, calls `deployApplication()` from `frontend/services/api.ts` which posts to `POST /deploy` on the Express backend.
- Passes the full `DeploymentConfig` payload including `resources`, `env`, and `healthCheck`.

---

## 2. Deployment Progress Modal (`frontend/components/deploy-progress-modal.tsx`)

An animated overlay modal that appears after the form is submitted and walks through each step of the deployment pipeline.

### Steps
1. **Clone Repository** — Simulates `git clone` with log output
2. **Build Docker Image** — Simulates `docker build` layer output
3. **Generate Manifests** — Simulates YAML generation log
4. **kubectl apply** — Fires the real backend `deployFn()` call here

### Features
- **Step Timeline**: Each step renders with colour-coded status: `pending → running → done / error`
- **Live Log Terminal**: A scrollable dark terminal panel showing colorised log lines in real time (green for success, indigo for commands, red for errors)
- **Error Recovery**: If the backend call fails, the step turns red and an error card appears with the backend message
- **Success Action**: On full success, a green card appears and the router automatically navigates to `/dashboard/applications`

---

## 3. Zod v4 Compatibility Notes

- `z.number()` in zod v4 no longer accepts `invalid_type_error` — use `error` or just `z.number()` with plain `.min()/.max()` messages.
- `z.coerce` and `z.preprocess` produce `unknown` as their **input** type, which conflicts with `zodResolver` generic. The correct fix is `z.number()` + `{ valueAsNumber: true }` in `register()`.

---

## 4. Compilation Verification

```bash
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /dashboard
├ ○ /dashboard/deploy
└ ○ /login

○  (Static)  prerendered as static content
```
Zero TypeScript errors. Build time: ~7s Turbopack.
