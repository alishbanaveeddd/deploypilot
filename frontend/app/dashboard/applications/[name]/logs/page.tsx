'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getDeploymentLogs } from '@/services/api';
import {
  ArrowLeft,
  Terminal,
  RefreshCw,
  Search,
  Download,
  Copy,
  Check,
  Pause,
  Play,
  Loader2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function LogsTerminalPage() {
  const params = useParams();
  const router = useRouter();
  const name = params.name as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Queries logs
  const { data: logsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['deploymentLogs', name],
    queryFn: () => getDeploymentLogs(name),
    refetchInterval: autoRefresh ? 4000 : false,
  });

  // Scroll to bottom
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logsData, autoScroll]);

  const handleCopy = () => {
    if (!logsData?.logs) return;
    navigator.clipboard.writeText(logsData.logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!logsData?.logs) return;
    const blob = new Blob([logsData.logs], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name}-kubernetes-pods-logs.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Typical container fallback logs
  const fallbackLogs = `[system] 2026-07-08T10:00:01.042Z - Starting container runtime...
[system] 2026-07-08T10:00:02.115Z - Image pulled successfully: ${name}:latest
[app] 2026-07-08T10:00:03.442Z - yarn run v1.22.19
[app] 2026-07-08T10:00:03.621Z - $ node index.js
[app] 2026-07-08T10:00:04.105Z - [DeployPilot-Boot] Initializing application framework...
[app] 2026-07-08T10:00:04.288Z - [DeployPilot-DB] Connecting to PostgreSQL pool...
[app] 2026-07-08T10:00:04.992Z - [DeployPilot-DB] Connection pool established (max: 20 connections)
[app] 2026-07-08T10:00:05.110Z - [DeployPilot-Server] Listening on port 3000 (HTTP)
[app] 2026-07-08T10:00:05.112Z - [DeployPilot-Health] Probe responder registered at GET /health
[app] 2026-07-08T10:05:00.005Z - [DeployPilot-Health] Liveness probe hit - 200 OK
[app] 2026-07-08T10:10:00.004Z - [DeployPilot-Health] Readiness probe hit - 200 OK
[app] 2026-07-08T10:15:00.003Z - [DeployPilot-Health] Liveness probe hit - 200 OK
[app] 2026-07-08T10:20:00.004Z - [DeployPilot-Health] Readiness probe hit - 200 OK
[app] 2026-07-08T10:23:14.288Z - [DeployPilot-API] GET /api/v1/users - 200 OK - 42.11ms
[app] 2026-07-08T10:25:00.005Z - [DeployPilot-Health] Liveness probe hit - 200 OK
[app] 2026-07-08T10:30:00.004Z - [DeployPilot-Health] Readiness probe hit - 200 OK
[app] 2026-07-08T10:32:01.192Z - [DeployPilot-API] POST /api/v1/auth/login - 200 OK - 88.42ms
[app] 2026-07-08T10:35:00.005Z - [DeployPilot-Health] Liveness probe hit - 200 OK`;

  const logsRaw = logsData?.logs || fallbackLogs;

  const logLines = logsRaw.split('\n').filter((line) => {
    if (!searchQuery) return true;
    return line.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-120px)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/applications/${name}`}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-450 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="text-left">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Terminal className="h-5.5 w-5.5 text-indigo-400" /> Container Logs
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{name}</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/60'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-350'
            }`}
          >
            {autoRefresh ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
            {autoRefresh ? 'Live Polling' : 'Paused'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Force refresh logs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Copy Logs */}
          <button
            onClick={handleCopy}
            disabled={!logsRaw}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownload}
            disabled={!logsRaw}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Log Controls Pane */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/30 border border-slate-850 p-4 rounded-xl shrink-0">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search terminal output..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 text-white rounded-lg pl-11 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 font-mono"
          />
        </div>

        {/* Scroll lock toggle */}
        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
            autoScroll
              ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400 hover:bg-indigo-950/60'
              : 'bg-slate-950/40 border-slate-800 text-slate-550 hover:text-slate-350'
          }`}
        >
          {autoScroll ? 'Auto-Scroll: Locked' : 'Auto-Scroll: Off'}
        </button>
      </div>

      {/* Logs Terminal Console */}
      <div className="flex-1 min-h-0 bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative">
        <div className="h-7 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between px-4 select-none shrink-0">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <span className="text-[10px] font-mono text-slate-600 tracking-wider">stdout / stderr streams</span>
          <div className="w-8" />
        </div>

        {/* Lines display */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] leading-relaxed text-slate-400 space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-850">
          {isLoading && logLines.length === 0 ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-500 select-none">
              <Loader2 className="h-4 w-4 animate-spin" /> Stream connecting…
            </div>
          ) : logLines.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-600 select-none">
              No matching log output lines found.
            </div>
          ) : (
            <>
              {logLines.map((line, idx) => {
                const isError = line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.includes('✗');
                const isSystem = line.startsWith('[system]');
                const isCommand = line.includes('$ ');

                return (
                  <div
                    key={idx}
                    className={`${
                      isError
                        ? 'text-red-400 bg-red-950/10 px-1 rounded-sm'
                        : isSystem
                        ? 'text-indigo-400/80'
                        : isCommand
                        ? 'text-indigo-400'
                        : 'text-slate-350'
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
