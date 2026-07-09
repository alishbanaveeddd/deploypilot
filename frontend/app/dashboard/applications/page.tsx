'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeployments, restartDeployment, scaleDeployment, deleteDeployment } from '@/services/api';
import {
  Search,
  SlidersHorizontal,
  Layers,
  Play,
  AlertTriangle,
  RefreshCw,
  MoreVertical,
  Terminal,
  Cpu,
  Trash2,
  Maximize2,
  Settings,
  Scale,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [scaleApp, setScaleApp] = useState<{ name: string; currentReplicas: number } | null>(null);
  const [deleteApp, setDeleteApp] = useState<string | null>(null);
  const [newReplicaCount, setNewReplicaCount] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Queries
  const { data: deployments, isLoading, refetch } = useQuery({
    queryKey: ['deployments'],
    queryFn: getDeployments,
    refetchInterval: 8000,
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Actions
  const handleRestart = async (name: string) => {
    try {
      await restartDeployment(name);
      showToast('success', `Rollout restart triggered for ${name}`);
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    } catch (err: any) {
      showToast('error', err.message || `Failed to restart ${name}`);
    }
  };

  const handleScale = async () => {
    if (!scaleApp) return;
    setActionLoading(true);
    try {
      await scaleDeployment(scaleApp.name, newReplicaCount);
      showToast('success', `Scaled ${scaleApp.name} to ${newReplicaCount} replicas`);
      setScaleApp(null);
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to scale application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteApp) return;
    setActionLoading(true);
    try {
      await deleteDeployment(deleteApp);
      showToast('success', `${deleteApp} deleted successfully`);
      setDeleteApp(null);
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete deployment');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter deployments
  const filteredDeployments = (deployments ?? []).filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render status badge helper
  const renderStatus = (status: string) => {
    if (status === 'Running') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/20 text-emerald-400">
          <Play className="h-3 w-3 fill-emerald-400" /> Running
        </span>
      );
    }
    if (status === 'Failed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-950/80 border border-red-500/20 text-red-400">
          <AlertTriangle className="h-3 w-3" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-950/80 border border-yellow-500/20 text-yellow-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Pending
      </span>
    );
  };

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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Applications</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, scale, monitor, and restart your active workloads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Link
            href="/dashboard/deploy"
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/20"
          >
            Deploy Workload
          </Link>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/30 border border-slate-850 p-4 rounded-xl">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search workloads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 text-white rounded-lg pl-11 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 font-mono"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          {['All', 'Running', 'Not Ready', 'Failed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950/40 border border-slate-800 text-slate-450 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" />
            <p className="text-slate-500 text-sm">Querying active namespaces...</p>
          </div>
        ) : filteredDeployments.length === 0 ? (
          <div className="p-16 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl">
            <Layers className="h-12 w-12 text-slate-600 mx-auto" />
            <div>
              <p className="text-white font-bold text-base">No Workloads Found</p>
              <p className="text-slate-500 text-sm mt-1">Try adapting your filters or deploy a new workload.</p>
            </div>
            <Link
              href="/dashboard/deploy"
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Deploy First App
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-widest">Application</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-widest">Replicas</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-widest">Target Image</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-widest">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-450 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {filteredDeployments.map((app) => (
                  <tr key={app.name} className="hover:bg-slate-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-left">
                        <Link
                          href={`/dashboard/applications/${app.name}`}
                          className="font-bold text-sm text-slate-200 hover:text-indigo-400 transition-colors"
                        >
                          {app.name}
                        </Link>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">default-ns</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{renderStatus(app.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-200 font-mono">{app.ready}</span>
                        <span className="text-slate-650 text-xs">/</span>
                        <span className="text-xs text-slate-500 font-mono">{app.replicas} ready</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400 font-mono truncate max-w-[200px] block" title={app.image}>
                        {app.image || 'nginx:alpine'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-450 font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-600" />
                        <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Just now'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/applications/${app.name}`}
                          className="p-2 text-slate-450 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          title="View Specs"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/applications/${app.name}/logs`}
                          className="p-2 text-slate-450 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                          title="View Logs"
                        >
                          <Terminal className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setNewReplicaCount(app.replicas);
                            setScaleApp({ name: app.name, currentReplicas: app.replicas });
                          }}
                          className="p-2 text-slate-450 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                          title="Scale"
                        >
                          <Scale className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRestart(app.name)}
                          className="p-2 text-slate-450 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                          title="Restart"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteApp(app.name)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Scale Workload */}
      {scaleApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setScaleApp(null)} />
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white">Scale Replicas</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{scaleApp.name}</p>
              </div>
              <button
                onClick={() => setScaleApp(null)}
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
                    onClick={() => setNewReplicaCount(Math.max(1, newReplicaCount - 1))}
                    className="w-10 h-10 bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newReplicaCount}
                    onChange={(e) => setNewReplicaCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                    className="flex-1 h-10 bg-slate-950 border border-slate-800 text-center text-white font-mono text-sm rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setNewReplicaCount(Math.min(20, newReplicaCount + 1))}
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
                onClick={() => setScaleApp(null)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 text-xs font-semibold text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScale}
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
      {deleteApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeleteApp(null)} />
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-white">Delete Workload</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{deleteApp}</p>
              </div>
              <button
                onClick={() => setDeleteApp(null)}
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
                onClick={() => setDeleteApp(null)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-750 text-xs font-semibold text-slate-355 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
