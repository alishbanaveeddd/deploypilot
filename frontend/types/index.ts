export interface EnvVar {
  name: string;
  value: string;
}

export interface Resources {
  cpuLimit?: string;
  memoryLimit?: string;
  cpuRequest?: string;
  memoryRequest?: string;
}

export interface HealthCheck {
  path: string;
  port?: number;
  initialDelaySeconds?: number;
  periodSeconds?: number;
}

export interface DeploymentConfig {
  appName: string;
  repoUrl: string;
  branch: string;
  replicas: number;
  containerPort: number;
  servicePort: number;
  resources?: Resources;
  env?: EnvVar[];
  healthCheck?: HealthCheck;
}

export interface PodInfo {
  name: string;
  status: string;
  ip: string;
  node: string;
  createdAt: string;
  restartCount: number;
}

export interface EventInfo {
  type: string;
  reason: string;
  message: string;
  age: string;
  source: string;
}

export interface DeploymentStatus {
  name: string;
  status: 'Running' | 'Not Ready' | 'Failed' | 'Pending';
  replicas: number;
  ready: number;
  available: number;
  image: string;
  pods?: PodInfo[];
  resources?: Resources;
  events?: EventInfo[];
  deploymentYaml?: string;
  serviceYaml?: string;
  env?: EnvVar[];
  namespace?: string;
  createdAt?: string;
  restartCount?: number;
  clusterIp?: string;
  servicePort?: number;
}

export interface NodeInfo {
  name: string;
  status: string;
  role: string;
  version: string;
  cpuCapacity: string;
  memoryCapacity: string;
}

export interface ClusterStatus {
  nodes: NodeInfo[];
  podsCount: number;
  deploymentsCount: number;
  servicesCount: number;
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  namespaces: string[];
  health: 'Healthy' | 'Degraded' | 'Critical';
}
