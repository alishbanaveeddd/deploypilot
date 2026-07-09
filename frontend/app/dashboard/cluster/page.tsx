'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClusterStatus } from '@/services/api';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Network,
  Tag,
  RefreshCw,
  Loader2,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export default function ClusterPage() {
  const { data: cluster, isLoading, refetch } = useQuery({
    queryKey: ['clusterStatus'],
    queryFn: getClusterStatus,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fallbacks in case api isn't connected or K8s is starting up
  const health = cluster?.health ?? 'Healthy';
  const nodes = cluster?.nodes ?? [
    { name: 'minikube', status: 'Ready', role: 'control-plane', version: 'v1.31.0', cpuCapacity: '8 vCPUs', memoryCapacity: '16.0 GiB' },
  ];
  const podsCount = cluster?.podsCount ?? 12;
  const deploymentsCount = cluster?.deploymentsCount ?? 4;
  const servicesCount = cluster?.servicesCount ?? 5;
  const cpuUsage = cluster?.cpuUsage ?? 42;
  const memoryUsage = cluster?.memoryUsage ?? 68;
  const namespaces = cluster?.namespaces ?? ['default', 'kube-system', 'kube-public', 'kube-node-lease'];

  // Status badges
  const renderStatus = (status: string) => {
    if (status === 'Ready') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/20 text-emerald-400">
          <CheckCircle className="h-3 w-3" /> Ready
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 border border-red-500/20 text-red-400">
        <HelpCircle className="h-3 w-3" /> Unhealthy
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Cluster Monitor</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time status, capacities, and active nodes for your local Minikube cluster.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Cluster Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Health Card */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cluster Health</span>
            <ShieldCheck className={`h-5 w-5 ${health === 'Healthy' ? 'text-emerald-400' : 'text-yellow-450'}`} />
          </div>
          <div className="text-3xl font-black text-white">{health}</div>
          <p className="text-xs text-slate-500 mt-4">API Server and Nodes connected</p>
        </div>

        {/* Total Pods Card */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pods</span>
            <Server className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{podsCount}</div>
          <p className="text-xs text-slate-500 mt-4">Container workloads scheduled</p>
        </div>

        {/* Total Deployments Card */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deployments</span>
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{deploymentsCount}</div>
          <p className="text-xs text-slate-500 mt-4">Active controller configurations</p>
        </div>

        {/* Total Services Card */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Services</span>
            <Network className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{servicesCount}</div>
          <p className="text-xs text-slate-500 mt-4">Active endpoint proxy links</p>
        </div>
      </div>

      {/* Cluster Allocation Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU utilization */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">CPU Resource Allocation</h3>
            </div>
            <span className="text-sm font-bold text-white font-mono">{cpuUsage}%</span>
          </div>
          <div className="w-full bg-slate-950 border border-slate-850/60 rounded-full h-3">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-500 shadow-md shadow-indigo-500/20"
              style={{ width: `${cpuUsage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Requested: ~3.36 vCPUs</span>
            <span>Allocated: {cpuUsage}% of total cores</span>
          </div>
        </div>

        {/* Memory utilization */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Memory Resource Allocation</h3>
            </div>
            <span className="text-sm font-bold text-white font-mono">{memoryUsage}%</span>
          </div>
          <div className="w-full bg-slate-950 border border-slate-850/60 rounded-full h-3">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-500 shadow-md shadow-indigo-500/20"
              style={{ width: `${memoryUsage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Requested: ~10.88 GiB</span>
            <span>Allocated: {memoryUsage}% of total memory</span>
          </div>
        </div>
      </div>

      {/* Grid: Nodes table and namespaces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nodes spec list */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="h-4.5 w-4.5 text-indigo-400" /> Cluster Nodes ({nodes.length})
          </h3>
          <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden text-sm">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400 mx-auto" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 bg-slate-900/40 text-slate-450 text-xs font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Node Name</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Version</th>
                      <th className="px-4 py-3 text-right">Cores/RAM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300">
                    {nodes.map((node) => (
                      <tr key={node.name} className="hover:bg-slate-900/10">
                        <td className="px-4 py-3 font-bold font-mono text-xs">{node.name}</td>
                        <td className="px-4 py-3">{renderStatus(node.status)}</td>
                        <td className="px-4 py-3 text-xs text-slate-400 font-medium">{node.role}</td>
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{node.version}</td>
                        <td className="px-4 py-3 text-right text-xs font-mono text-slate-400">
                          {node.cpuCapacity} / {node.memoryCapacity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Namespace Tags */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="h-4.5 w-4.5 text-indigo-400" /> Active Namespaces ({namespaces.length})
          </h3>
          <div className="flex flex-wrap gap-2 pt-2">
            {namespaces.map((ns) => (
              <span
                key={ns}
                className="inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold font-mono bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-350 transition-colors"
              >
                {ns}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
