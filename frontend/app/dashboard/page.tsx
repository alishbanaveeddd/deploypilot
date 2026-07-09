'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeployments, getClusterStatus } from '@/services/api';
import { 
  Play, 
  Layers, 
  AlertTriangle, 
  Activity, 
  Cpu, 
  HardDrive, 
  ArrowUpRight, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Queries
  const { data: deployments, isLoading: loadingDeploys, isError: deployError, refetch: refetchDeploys } = useQuery({
    queryKey: ['deployments'],
    queryFn: getDeployments,
    refetchInterval: 12000,
  });

  const { data: cluster, isLoading: loadingCluster, isError: clusterError, refetch: refetchCluster } = useQuery({
    queryKey: ['clusterStatus'],
    queryFn: getClusterStatus,
    refetchInterval: 12000,
  });

  const handleRefreshAll = () => {
    refetchDeploys();
    refetchCluster();
  };

  // Safe metrics compute with fallbacks
  const totalApps = deployments?.length ?? 0;
  const runningApps = deployments?.filter(d => d.status === 'Running').length ?? 0;
  const failedApps = deployments?.filter(d => d.status === 'Failed' || d.status === 'Not Ready').length ?? 0;
  const clusterHealth = cluster?.health ?? 'Healthy';
  const cpuPercent = cluster?.cpuUsage ?? 0;
  const memoryPercent = cluster?.memoryUsage ?? 0;

  // Recent deployments list fallback
  const recentActivity = deployments?.map(d => ({
    name: d.name,
    status: d.status,
    image: d.image || 'nginx:alpine',
    time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : 'N/A'
  })).slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time status of your Kubernetes clusters and active workloads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Status
          </button>
          <Link
            href="/dashboard/deploy"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            Deploy App
          </Link>
        </div>
      </div>

      {/* Grid: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Running Apps */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Play className="h-24 w-24 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Running Applications</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Play className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{runningApps}</span>
            <span className="text-xs text-slate-500">/ {totalApps} active</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400">
            <span className="font-semibold">Healthy workloads online</span>
          </div>
        </div>

        {/* Card 2: Total Deployments */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Layers className="h-24 w-24 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Deployments</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{totalApps}</span>
            <span className="text-xs text-slate-500">manifests loaded</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-indigo-400">
            <span className="font-semibold">Synced with Minikube</span>
          </div>
        </div>

        {/* Card 3: Failed Deployments */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="h-24 w-24 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Failed Workloads</span>
            <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-red-400">{failedApps}</span>
            <span className="text-xs text-slate-500">requiring action</span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
            <span>{failedApps > 0 ? 'Review logs & pod events' : 'No warnings reported'}</span>
          </div>
        </div>

        {/* Card 4: Cluster Status */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-24 w-24 text-indigo-400" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cluster Health</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{clusterHealth}</span>
          </div>
          <div className="mt-6 text-xs text-slate-400 flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>K8s orchestrator reporting OK</span>
          </div>
        </div>

        {/* Card 5: CPU Usage */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CPU Capacity</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Cpu className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black text-white">{cpuPercent}%</span>
            <span className="text-xs text-slate-500">utilized</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${cpuPercent}%` }}
            />
          </div>
        </div>

        {/* Card 6: Memory Usage */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm group hover:border-slate-800 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Memory Allocation</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <HardDrive className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-black text-white">{memoryPercent}%</span>
            <span className="text-xs text-slate-500">utilized</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${memoryPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Deployments Bar Chart */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Recent Deployments</h3>
              <p className="text-xs text-slate-500">Deployments compiled successfully over the last 7 days.</p>
            </div>
            <div className="text-xs font-semibold text-indigo-450 bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-500/20">
              Total: 25 Runs
            </div>
          </div>
          
          {/* Custom SVG Bar Chart */}
          <div className="w-full h-64 flex items-end justify-between px-2 pt-4 relative">
            {/* Grid lines */}
            <div className="absolute inset-x-0 bottom-6 border-b border-slate-800/80" />
            <div className="absolute inset-x-0 bottom-24 border-b border-slate-800/40" />
            <div className="absolute inset-x-0 bottom-44 border-b border-slate-800/20" />
            
            {/* Chart Bars */}
            {[
              { label: 'Mon', value: 2, pct: 25 },
              { label: 'Tue', value: 5, pct: 62.5 },
              { label: 'Wed', value: 3, pct: 37.5 },
              { label: 'Thu', value: 8, pct: 100 },
              { label: 'Fri', value: 4, pct: 50 },
              { label: 'Sat', value: 1, pct: 12.5 },
              { label: 'Sun', value: 2, pct: 25 },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-2 group/bar z-10 w-[12%]">
                {/* Tooltip */}
                <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 border border-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-xl -mt-6 whitespace-nowrap absolute">
                  {bar.value} deployments
                </div>
                {/* Bar */}
                <div className="w-full bg-slate-800/40 hover:bg-slate-800 rounded-t-md transition-all flex items-end h-48 cursor-pointer">
                  <div 
                    className="bg-indigo-600 group-hover/bar:bg-indigo-500 w-full rounded-t-md transition-all duration-700 shadow-lg shadow-indigo-600/10 group-hover/bar:shadow-indigo-500/20" 
                    style={{ height: `${bar.pct}%` }}
                  />
                </div>
                {/* Label */}
                <span className="text-[10px] font-semibold text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate Gauge */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Deployment Success</h3>
            <p className="text-xs text-slate-500">Rollout completions vs rollback errors.</p>
          </div>

          <div className="flex items-center justify-center my-6 relative">
            {/* Custom SVG Radial progress */}
            <svg className="w-40 h-40 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-slate-800/50"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-indigo-500"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * 92.5) / 100}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white">92.5%</span>
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-1">Success</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Completed Rollouts</span>
              <span className="text-slate-200">23</span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Failed / Rollback</span>
              <span className="text-red-400">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Cluster Utilization & Workloads list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cluster Utilization Area Chart */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Cluster Utilization</h3>
              <p className="text-xs text-slate-500">CPU and memory consumption profiles over the last 6 hours.</p>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-slate-400">CPU</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-slate-400">Memory</span>
              </div>
            </div>
          </div>

          {/* Area Chart SVG */}
          <div className="w-full h-52 relative">
            <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* CPU Area with Gradient */}
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(96, 165, 250)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="rgb(96, 165, 250)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>

              {/* Memory Area */}
              <path
                d="M0,130 Q100,100 200,140 T400,120 T600,90 L600,200 L0,200 Z"
                fill="url(#memGrad)"
              />
              <path
                d="M0,130 Q100,100 200,140 T400,120 T600,90"
                fill="none"
                stroke="rgb(96, 165, 250)"
                strokeWidth="2.5"
              />

              {/* CPU Area */}
              <path
                d="M0,170 Q100,110 200,150 T400,90 T600,110 L600,200 L0,200 Z"
                fill="url(#cpuGrad)"
              />
              <path
                d="M0,170 Q100,110 200,150 T400,90 T600,110"
                fill="none"
                stroke="rgb(99, 102, 241)"
                strokeWidth="2.5"
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] font-semibold text-slate-500">
              <span>-6h</span>
              <span>-4h</span>
              <span>-2h</span>
              <span>Now</span>
            </div>
          </div>
        </div>

        {/* Workloads list */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Recent Workloads</h3>
            
            {/* Deployments list */}
            <div className="space-y-3.5">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-slate-500 border border-dashed border-slate-850 rounded-xl bg-slate-950/20">
                  <p className="text-xs font-semibold">No recent workloads</p>
                  <p className="text-[10px] text-slate-600 mt-1">Deploy an application to see it here.</p>
                </div>
              ) : (
                recentActivity.map((app) => (
                  <div 
                    key={app.name} 
                    className="bg-slate-950/40 border border-slate-850/60 p-3.5 rounded-xl flex items-center justify-between hover:border-slate-800 transition-colors"
                  >
                    <div className="flex flex-col text-left overflow-hidden pr-2">
                      <span className="text-xs font-semibold text-slate-200 truncate">{app.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{app.image}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        app.status === 'Running' 
                          ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-red-950/80 border border-red-500/20 text-red-400'
                      }`}>
                        {app.status}
                      </span>
                      <span className="text-[9px] text-slate-550 flex items-center gap-1 font-medium">
                        <Clock className="h-2.5 w-2.5" />
                        {app.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/dashboard/applications"
            className="w-full mt-6 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-350 hover:text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Manage Workloads
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
