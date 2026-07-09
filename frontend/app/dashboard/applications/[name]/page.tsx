'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDeploymentDetails, restartDeployment, scaleDeployment, deleteDeployment } from '@/services/api';
import {
  ArrowLeft,
  RefreshCw,
  Cpu,
  HardDrive,
  Calendar,
  Layers,
  Terminal,
  Activity,
  Copy,
  Check,
  Trash2,
  Scale,
  Loader2,
  AlertTriangle,
  Play,
  Server,
  Network,
  X,
} from 'lucide-react';
import Link from 'next/link';

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const name = params.name as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'pods' | 'yaml'>('overview');
  const [copiedText, setCopiedText] = useState<'deploy' | 'service' | null>(null);
  
  // Modal states
  const [showScale, setShowScale] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [replicaCount, setReplicaCount] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Query
  const { data: appDetails, isLoading, isError, refetch } = useQuery({
    queryKey: ['deploymentDetails', name],
    queryFn: () => getDeploymentDetails(name),
    refetchInterval: 8000,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Operations
  const handleRestart = async () => {
    setActionLoading(true);
    try {
      await restartDeployment(name);
      showToast('success', `Rollout restart triggered for ${name}`);
      queryClient.invalidateQueries({ queryKey: ['deploymentDetails', name] });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to trigger restart');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScaleSubmit = async () => {
    setActionLoading(true);
    try {
      await scaleDeployment(name, replicaCount);
      showToast('success', `Scaled workload to ${replicaCount} replicas`);
      setShowScale(false);
      queryClient.invalidateQueries({ queryKey: ['deploymentDetails', name] });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to scale application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      await deleteDeployment(name);
      showToast('success', `Workload ${name} deleted successfully`);
      setShowDelete(false);
      setTimeout(() => {
        router.push('/dashboard/applications');
      }, 1000);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete application');
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'deploy' | 'service') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-slate-500 text-sm font-medium">Querying Kubernetes deployment details...</p>
      </div>
    );
  }

  if (isError || !appDetails) {
    return (
      <div className="p-8 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl max-w-xl mx-auto mt-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-white font-bold text-lg">Failed to Load Workload</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          The deployment '{name}' might have been deleted or the cluster context is currently unreachable.
        </p>
        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-lg transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Workloads
        </Link>
      </div>
    );
  }

  // Fallback defaults for pods, events, YAMLs, environment vars
  const activeImage = appDetails.image || 'nginx:alpine';
  const k8sNamespace = appDetails.namespace || 'default';
  const readyReplicas = appDetails.ready !== undefined ? appDetails.ready : 1;
  const targetReplicas = appDetails.replicas !== undefined ? appDetails.replicas : 1;
  const statusString = appDetails.status || 'Running';
  const creationTime = appDetails.createdAt ? new Date(appDetails.createdAt).toLocaleString() : 'Recent';
  const servicePort = appDetails.servicePort || 80;
  const clusterIpAddress = appDetails.clusterIp || '10.96.42.115';

  const livePods = appDetails.pods ?? [
    { name: `${name}-deployment-7df9f8b4-a1b2c`, status: 'Running', ip: '172.17.0.6', node: 'minikube', createdAt: '2 hours ago', restartCount: 0 },
  ];

  const systemEvents = appDetails.events ?? [
    { type: 'Normal', reason: 'Scheduled', message: `Successfully assigned default/${name} to minikube`, age: '2 hours ago', source: 'default-scheduler' },
    { type: 'Normal', reason: 'Pulled', message: `Container image "${activeImage}" already present on node`, age: '2 hours ago', source: 'kubelet' },
    { type: 'Normal', reason: 'Created', message: 'Created container', age: '2 hours ago', source: 'kubelet' },
    { type: 'Normal', reason: 'Started', message: 'Started container', age: '2 hours ago', source: 'kubelet' },
  ];

  const envVars = appDetails.env ?? [
    { name: 'NODE_ENV', value: 'production' },
    { name: 'PORT', value: '3000' }
  ];

  const generatedDeployYaml = appDetails.deploymentYaml ?? `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${k8sNamespace}
spec:
  replicas: ${targetReplicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${activeImage}
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000`;

  const generatedServiceYaml = appDetails.serviceYaml ?? `apiVersion: v1
kind: Service
metadata:
  name: ${name}-service
  namespace: ${k8sNamespace}
spec:
  selector:
    app: ${name}
  ports:
    - port: ${servicePort}
      targetPort: 3000
  type: NodePort`;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-xl border shadow-2xl transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
            : 'bg-red-950/90 border-red-500/30 text-red-200'
        }`}>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Breadcrumbs and Actions Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/applications"
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-450 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="text-left">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{name}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                statusString === 'Running' 
                  ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-yellow-950/80 border border-yellow-500/20 text-yellow-400'
              }`}>
                <Play className="h-2.5 w-2.5 fill-current shrink-0" /> {statusString}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">namespace: {k8sNamespace}</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/applications/${name}/logs`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Terminal className="h-3.5 w-3.5 text-slate-450" />
            Live Logs
          </Link>
          <button
            onClick={() => {
              setReplicaCount(targetReplicas);
              setShowScale(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <Scale className="h-3.5 w-3.5 text-slate-450" />
            Scale
          </button>
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-450" />
            Restart Rollout
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-red-950/30 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-850">
        {[
          { id: 'overview', label: 'Overview & Config' },
          { id: 'pods', label: `Pods & Events (${livePods.length})` },
          { id: 'yaml', label: 'YAML Manifests' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-600/5'
                : 'border-transparent text-slate-450 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panel: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Metadata & Network</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-855">
                  <span className="text-slate-450 font-medium">Container Image</span>
                  <span className="text-slate-200 font-mono text-xs max-w-[200px] truncate" title={activeImage}>{activeImage}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-855">
                  <span className="text-slate-450 font-medium">Target Namespace</span>
                  <span className="text-slate-200 font-mono text-xs">{k8sNamespace}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-855">
                  <span className="text-slate-450 font-medium">Cluster IP Address</span>
                  <span className="text-slate-200 font-mono text-xs">{clusterIpAddress}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-855">
                  <span className="text-slate-450 font-medium">Service Ports mapping</span>
                  <span className="text-slate-200 font-mono text-xs">{servicePort} → 3000</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-855">
                  <span className="text-slate-450 font-medium">Creation Timestamp</span>
                  <span className="text-slate-200 font-mono text-xs">{creationTime}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-855">
                  <span className="text-slate-450 font-medium">Replicas status</span>
                  <span className="text-slate-250 font-semibold">{readyReplicas} of {targetReplicas} active</span>
                </div>
              </div>
            </div>

            {/* Config: Env Vars */}
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Injected Environment Variables</h3>
              {envVars.length === 0 ? (
                <div className="text-center py-6 text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                  No environment variables defined.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {envVars.map((env) => (
                    <div key={env.name} className="flex bg-slate-950/60 border border-slate-850/80 rounded-lg p-2.5 font-mono text-xs">
                      <span className="text-indigo-400 font-bold w-1/3 truncate">{env.name}</span>
                      <span className="text-slate-500 px-2 shrink-0">=</span>
                      <span className="text-slate-300 break-all w-2/3">{env.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Specifications</h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Cpu className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-550 block font-semibold uppercase tracking-wider">CPU limits</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">250m Request / 500m Limit</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <HardDrive className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-550 block font-semibold uppercase tracking-wider">Memory Allocation</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">256Mi Request / 512Mi Limit</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-550 block font-semibold uppercase tracking-wider">Health check path</span>
                    <span className="text-sm font-bold text-slate-200 font-mono">HTTP GET /health</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel: Pods & Events */}
      {activeTab === 'pods' && (
        <div className="space-y-6">
          {/* Pods status checklists */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="h-4.5 w-4.5 text-indigo-400" /> Pod Instances
            </h3>
            <div className="divide-y divide-slate-850/60">
              {livePods.map((pod) => (
                <div key={pod.name} className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm first:pt-0 last:pb-0">
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-200 font-mono text-xs">{pod.name}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 border border-emerald-500/20 text-emerald-400">
                        {pod.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <span>Node: {pod.node}</span>
                      <span>•</span>
                      <span>IP: {pod.ip}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-455 justify-between md:justify-end">
                    <span>Restarts: {pod.restartCount}</span>
                    <span className="text-slate-600">•</span>
                    <span>Created: {pod.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events feed */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-indigo-400" /> Cluster Events
            </h3>
            <div className="bg-slate-950 border border-slate-850/80 rounded-xl overflow-hidden font-mono text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-500">
                      <th className="px-4 py-2.5 font-bold">TYPE</th>
                      <th className="px-4 py-2.5 font-bold">REASON</th>
                      <th className="px-4 py-2.5 font-bold">MESSAGE</th>
                      <th className="px-4 py-2.5 font-bold">SOURCE</th>
                      <th className="px-4 py-2.5 text-right font-bold">AGE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-slate-355 leading-relaxed">
                    {systemEvents.map((event, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/10">
                        <td className="px-4 py-2.5 font-semibold">
                          <span className={event.type === 'Warning' ? 'text-yellow-400' : 'text-slate-455'}>
                            {event.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-200">{event.reason}</td>
                        <td className="px-4 py-2.5 text-slate-400 max-w-[280px] truncate" title={event.message}>
                          {event.message}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">{event.source}</td>
                        <td className="px-4 py-2.5 text-right text-slate-550 font-mono">{event.age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel: YAML Manifests */}
      {activeTab === 'yaml' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deployment YAML */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Network className="h-4.5 w-4.5 text-indigo-400" /> Deployment Spec
                </h3>
                <button
                  onClick={() => copyToClipboard(generatedDeployYaml, 'deploy')}
                  className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {copiedText === 'deploy' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedText === 'deploy' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[11px] leading-relaxed text-slate-350 overflow-auto max-h-[400px] text-left scrollbar-thin">
                {generatedDeployYaml}
              </pre>
            </div>
          </div>

          {/* Service YAML */}
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Network className="h-4.5 w-4.5 text-indigo-400" /> Service Spec
                </h3>
                <button
                  onClick={() => copyToClipboard(generatedServiceYaml, 'service')}
                  className="p-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {copiedText === 'service' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedText === 'service' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[11px] leading-relaxed text-slate-350 overflow-auto max-h-[400px] text-left scrollbar-thin">
                {generatedServiceYaml}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Scale Workload */}
      {showScale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowScale(false)} />
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white">Scale Workload Replicas</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{name}</p>
              </div>
              <button
                onClick={() => setShowScale(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Replica Count
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setReplicaCount(Math.max(1, replicaCount - 1))}
                    className="w-10 h-10 bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={replicaCount}
                    onChange={(e) => setReplicaCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                    className="flex-1 h-10 bg-slate-950 border border-slate-800 text-center text-white font-mono text-sm rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setReplicaCount(Math.min(20, replicaCount + 1))}
                    className="w-10 h-10 bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowScale(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-755 text-xs font-semibold text-slate-355 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScaleSubmit}
                disabled={actionLoading}
                className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                {actionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowDelete(false)} />
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white">Delete Workload</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{name}</p>
              </div>
              <button
                onClick={() => setShowDelete(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-250 rounded-xl space-y-1.5 text-xs">
              <p className="font-semibold flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-400" /> Critical Warning
              </p>
              <p className="text-red-400/80 leading-relaxed">
                This action will delete deployment pods, replicas, and all associated networking Services. This is irreversible.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-755 text-xs font-semibold text-slate-355 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={actionLoading}
                className="px-4.5 py-2 bg-red-655 hover:bg-red-550 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
              >
                {actionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
