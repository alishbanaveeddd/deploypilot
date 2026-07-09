import { DeploymentConfig, DeploymentStatus, ClusterStatus } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getNamespaceHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const ns = localStorage.getItem('k8sNamespace') || 'default';
    return { 'X-Namespace': ns };
  }
  return { 'X-Namespace': 'default' };
}

export async function deployApplication(config: DeploymentConfig): Promise<{ success: boolean; message: string; app: string }> {
  const response = await fetch(`${API_BASE_URL}/deploy`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getNamespaceHeader()
    },
    body: JSON.stringify(config),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to deploy application');
  }
  
  return response.json();
}

export async function getDeployments(): Promise<DeploymentStatus[]> {
  const response = await fetch(`${API_BASE_URL}/deployments`, {
    headers: getNamespaceHeader()
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch deployments');
  }
  return response.json();
}

export async function getDeploymentDetails(name: string): Promise<DeploymentStatus> {
  const response = await fetch(`${API_BASE_URL}/deployments/${name}`, {
    headers: getNamespaceHeader()
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch details for ${name}`);
  }
  return response.json();
}

export async function deleteDeployment(name: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/deployments/${name}`, {
    method: 'DELETE',
    headers: getNamespaceHeader()
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to delete deployment ${name}`);
  }
  return response.json();
}

export async function restartDeployment(name: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/deployments/${name}/restart`, {
    method: 'POST',
    headers: getNamespaceHeader()
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to restart deployment ${name}`);
  }
  return response.json();
}

export async function scaleDeployment(name: string, replicas: number): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/deployments/${name}/scale`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...getNamespaceHeader()
    },
    body: JSON.stringify({ replicas }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to scale deployment ${name}`);
  }
  return response.json();
}

export async function getDeploymentLogs(name: string): Promise<{ logs: string }> {
  const response = await fetch(`${API_BASE_URL}/deployments/${name}/logs`, {
    headers: getNamespaceHeader()
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch logs for ${name}`);
  }
  return response.json();
}

export async function getClusterStatus(): Promise<ClusterStatus> {
  const response = await fetch(`${API_BASE_URL}/cluster`, {
    headers: getNamespaceHeader()
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch cluster status');
  }
  return response.json();
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: getNamespaceHeader()
  });
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }
  return response.json();
}
