


<h1 align="center">
  <br>
  🚀 DeployPilot
  <br>
</h1>

<h4 align="center">A Kubernetes-Based Auto Scaling SaaS Platform</h4>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#local-setup">Local Setup</a> •
  <a href="#contributing">Contributing</a>
</p>
A cloud-native deployment platform that automates Git repository cloning, Docker image building, and Kubernetes deployments through a modern web dashboard.
![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5)

---

## ✨ Features

- 🚀 One-click application deployments
- 📦 Automatic Git repository cloning
- 🐳 Docker image building
- ☸️ Kubernetes Deployment & Service generation
- 📊 Deployment monitoring
- 📜 Application status API
- 🔄 Redeploy applications
- 📈 Production-ready architecture
---

## 📖 Overview

**DeployPilot** is a powerful, modern, and intuitive Software-as-a-Service (SaaS) platform built to automate the deployment, scaling, and management of containerized applications on Kubernetes. 

Designed for developers who want the simplicity of serverless platforms (like Vercel or Heroku) but the underlying power and flexibility of Kubernetes, DeployPilot takes your GitHub repository and automatically containerizes, deploys, and monitors your application in real-time.

## ✨ Features

- **Automated Deployments:** Give it a Git repository URL, and DeployPilot automatically clones, builds a Docker image, and deploys it to your Kubernetes cluster.
- **Dynamic Namespace Routing:** Isolate environments (e.g., `staging`, `production`, `testing`) seamlessly.
- **Real-time Log Streaming:** Watch your deployment and build progress live in the browser.
- **Beautiful Dashboard:** Built with Next.js, featuring a sleek, responsive, and dark-mode optimized UI.
- **Live Kubernetes Metrics:** View Pod statuses, ReplicaSets, active Services, and Cluster events in real-time.
- **Zero-Downtime Rollouts:** Monitor progressive rollout statuses to ensure high availability.
- **Live YAML Manifests:** Inspect the exact auto-generated Deployment and Service YAML manifests applied to your cluster directly from the UI.

## 🏗️ Architecture

DeployPilot is split into a highly decoupled architecture:

* **Frontend (Next.js & React):** A modern SPA that provides a seamless user experience, deployed with beautiful UI components and reactive states.
* **Backend (Node.js & Express):** The engine room. It orchestrates `git`, `docker`, and `kubectl` commands, manages CORS, routes dynamic namespaces, and streams logs back to the frontend.
* **Infrastructure:** Powered by **Kubernetes** (Minikube/k3s) for container orchestration and **Docker** for image building.

---

## 📸 Screenshots

*(Add your screenshots here by saving them to a `docs/` folder!)*

### Applications Dashboard
<img width="947" height="437" alt="image" src="https://github.com/user-attachments/assets/3880fd4c-7838-4a7c-9f17-8049f2d070ab" />
<img width="947" height="431" alt="image" src="https://github.com/user-attachments/assets/b4ed310f-bc43-447e-93ea-d3a1ad953395" />


### Live YAML Manifests
<img width="676" height="360" alt="image" src="https://github.com/user-attachments/assets/d3b7f407-650a-4832-8de0-ffa8974d301e" />


### Overview & Configuration
<img width="685" height="313" alt="image" src="https://github.com/user-attachments/assets/be641313-3111-42a7-9096-ebb3bd38371c" />


### Pods & Events Monitoring
<img width="681" height="295" alt="image" src="https://github.com/user-attachments/assets/390d2d35-6f11-4f3f-8986-bf05ad902f23" />


---
## 🎥 Project Overview
https://github.com/user-attachments/assets/0a5661bd-8e51-4148-aa52-26150bc887a9
## 🐳 Docker & Containers Explained
https://github.com/user-attachments/assets/6108a6bf-1707-43f2-b1cb-20cfe5039df1
## 🚀 Local Setup

Want to run DeployPilot on your own machine? Follow these steps carefully.

### Prerequisites
Before you begin, ensure you have the following installed on your system:
1. [Node.js](https://nodejs.org/) (v18 or higher)
2. [Docker](https://www.docker.com/) (Running locally)
3. [Minikube](https://minikube.sigs.k8s.io/docs/start/) or a local Kubernetes cluster
4. [kubectl](https://kubernetes.io/docs/tasks/tools/)
5. [Git](https://git-scm.com/)

### 1. Start your Kubernetes Cluster
Start Minikube and ensure `kubectl` is configured to use it:
```bash
minikube start
kubectl cluster-info
```

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/deploypilot.git
cd deploypilot
```

### 3. Start the Backend
The backend orchestrates the deployments.
```bash
# In the root directory
npm install
node index.js
```
*The backend will start running on http://localhost:3000.*

### 4. Start the Frontend
Open a new terminal window/tab.
```bash
cd frontend
npm install
npm run dev
```
*The frontend will start running on http://localhost:3001.*

### 5. Access the Platform
Open your browser and navigate to `http://localhost:3001`. You can now deploy any public GitHub repository directly to your local Kubernetes cluster!

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/deploypilot/issues).

## 📝 License
This project is licensed under the MIT License.
