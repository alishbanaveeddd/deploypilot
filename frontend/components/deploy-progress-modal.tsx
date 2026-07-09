'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  GitBranch,
  PackageOpen,
  FileCode2,
  Rocket,
  Terminal,
  X,
} from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // ms to simulate this step
}

type StepStatus = 'pending' | 'running' | 'done' | 'error';

interface StepState {
  status: StepStatus;
  log?: string;
}

interface DeployProgressModalProps {
  config: any;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const STEPS: Step[] = [
  {
    id: 'clone',
    label: 'Clone Repository',
    description: 'Fetching source code from GitHub',
    icon: <GitBranch className="h-4 w-4" />,
    duration: 2200,
  },
  {
    id: 'build',
    label: 'Build Docker Image',
    description: 'Compiling Dockerfile and bundling layers',
    icon: <PackageOpen className="h-4 w-4" />,
    duration: 3800,
  },
  {
    id: 'manifest',
    label: 'Generate Manifests',
    description: 'Creating Deployment and Service YAML',
    icon: <FileCode2 className="h-4 w-4" />,
    duration: 1200,
  },
  {
    id: 'apply',
    label: 'kubectl apply',
    description: 'Applying manifests to the cluster',
    icon: <Rocket className="h-4 w-4" />,
    duration: 2500,
  },
];

export default function DeployProgressModal({
  config,
  onClose,
  onSuccess,
  onError,
}: DeployProgressModalProps) {
  const { appName, repoUrl } = config;
  const [stepStates, setStepStates] = useState<Record<string, StepState>>(
    Object.fromEntries(STEPS.map((s) => [s.id, { status: 'pending' as StepStatus }]))
  );
  const [currentLog, setCurrentLog] = useState<string[]>([]);
  const [overallStatus, setOverallStatus] = useState<'running' | 'success' | 'error'>('running');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const deploymentDispatched = React.useRef(false);

  useEffect(() => {
    if (deploymentDispatched.current) return;
    deploymentDispatched.current = true;
    runDeployment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: any;
    if (overallStatus === 'running') {
      interval = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [overallStatus]);

  const setStepStatus = (id: string, status: StepStatus) =>
    setStepStates((prev) => ({ ...prev, [id]: { status } }));

  const runDeployment = async () => {
    try {
      setProgress(5);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const ns = typeof window !== 'undefined' ? (localStorage.getItem('k8sNamespace') || 'default') : 'default';
      const response = await fetch(`${API_BASE_URL}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Namespace': ns },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the deployment backend service.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) {
        throw new Error('Response stream reader is undefined.');
      }

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Append line to active log console
          setCurrentLog((prev) => [...prev, trimmed]);

          // Dynamically check messages to advance UI states and stepper highlights
          if (trimmed.includes('[Git] Cloning')) {
            setStepStatus('clone', 'running');
            setProgress(10);
          } else if (trimmed.includes('[Git] Branch') && trimmed.includes('cloned successfully')) {
            setStepStatus('clone', 'done');
            setStepStatus('build', 'running');
            setProgress(30);
          } else if (trimmed.includes('[Git Warning]')) {
            setProgress(15);
          } else if (trimmed.includes('[Git] Default branch cloned successfully')) {
            setStepStatus('clone', 'done');
            setStepStatus('build', 'running');
            setProgress(30);
          } else if (trimmed.includes('Step ') && trimmed.includes('/') && trimmed.includes(':')) {
            setProgress((p) => Math.min(68, p + 2));
          } else if (trimmed.includes('[Docker] Image') && trimmed.includes('built successfully')) {
            setProgress(75);
          } else if (trimmed.includes('[Docker] Loading image')) {
            setProgress(80);
          } else if (trimmed.includes('[Docker] Image loaded successfully')) {
            setStepStatus('build', 'done');
            setProgress(85);
          } else if (trimmed.includes('[DeployPilot] Generating Kubernetes manifests')) {
            setStepStatus('manifest', 'running');
            setProgress(88);
          } else if (trimmed.includes('[DeployPilot] Applying config manifests')) {
            setStepStatus('manifest', 'done');
            setStepStatus('apply', 'running');
            setProgress(92);
          } else if (trimmed.includes('[Kubernetes Rollout]')) {
            setProgress(95);
            if (trimmed.includes('successfully rolled out')) {
              setStepStatus('apply', 'done');
              setProgress(100);
            }
          } else if (trimmed.includes('[SUCCESS]')) {
            setStepStatus('apply', 'done');
            setProgress(100);
            setOverallStatus('success');
            setTimeout(onSuccess, 1805);
          } else if (trimmed.includes('[ERROR]')) {
            setStepStates((prev) => {
              const updated = { ...prev };
              Object.keys(updated).forEach(k => {
                if (updated[k].status === 'running') {
                  updated[k].status = 'error';
                }
              });
              return updated;
            });
            setOverallStatus('error');
            setErrorMessage(trimmed.replace('[ERROR]', '').trim());
            onError(trimmed.replace('[ERROR]', '').trim());
            return;
          }
        }
      }
    } catch (err: any) {
      setOverallStatus('error');
      setErrorMessage(err.message || 'Unexpected error during deployment.');
      onError(err.message);
    }
  };

  const getStepIcon = (stepId: string, defaultIcon: React.ReactNode) => {
    const state = stepStates[stepId];
    if (state?.status === 'running') return <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />;
    if (state?.status === 'done') return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (state?.status === 'error') return <XCircle className="h-4 w-4 text-red-400" />;
    return <span className="text-slate-600">{defaultIcon}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Deploying Application</h2>
              <p className="text-xs text-slate-400 font-mono">{appName}</p>
            </div>
          </div>
          {(overallStatus === 'success' || overallStatus === 'error') && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Animated Progress Bar */}
          <div className="space-y-2 bg-slate-950/40 border border-slate-850 p-4.5 rounded-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-350 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                Pipeline status
              </span>
              <span className="text-indigo-400 font-bold font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-slate-950 border border-slate-850/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 shadow-md shadow-indigo-500/20"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>ELAPSED: {Math.floor(elapsed / 60)}m {elapsed % 60}s</span>
              <span>
                {progress < 95 
                  ? `~${Math.ceil((100 - progress) / 10)}s remaining` 
                  : 'Compiling Docker image & applying cluster route manifests...'}
              </span>
            </div>
          </div>

          {/* Docker Build / Kubectl Apply Advisory Warning Card */}
          {progress >= 70 && overallStatus === 'running' && (
            <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/10 text-slate-400 rounded-xl space-y-1.5 text-xs">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5 animate-pulse">
                🚀 Compilation & Cluster Rollout Active
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                Cold Docker builds (especially large projects like kuard) can take up to 2-4 minutes to pull compiler layers, install dependencies, and build components. The process is running in the background. Please keep this browser window open.
              </p>
            </div>
          )}

          {/* Step timeline */}
          <div className="space-y-1">
            {STEPS.map((step, idx) => {
              const state = stepStates[step.id];
              const isActive = state?.status === 'running';
              const isDone = state?.status === 'done';
              const isError = state?.status === 'error';
              const isPending = state?.status === 'pending';

              return (
                <div key={step.id}>
                  <div
                    className={`flex items-center gap-4 p-3.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-indigo-950/40 border border-indigo-500/20'
                        : isDone
                        ? 'bg-emerald-950/20 border border-emerald-500/10'
                        : isError
                        ? 'bg-red-950/20 border border-red-500/10'
                        : 'bg-slate-950/30 border border-slate-850/40'
                    }`}
                  >
                    {/* Step number or icon */}
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-400'
                          : isDone
                          ? 'bg-emerald-600/20 text-emerald-400'
                          : isError
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {getStepIcon(step.id, step.icon)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold transition-colors ${
                            isActive ? 'text-white' : isDone ? 'text-emerald-300' : isError ? 'text-red-300' : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Done</span>
                        )}
                        {isError && (
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Failed</span>
                        )}
                        {isActive && (
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider animate-pulse">
                            Running…
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs mt-0.5 transition-colors ${
                          isActive ? 'text-slate-300' : isDone ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {idx < STEPS.length - 1 && (
                    <div className="flex justify-start ml-7 my-0.5">
                      <div
                        className={`w-0.5 h-3 rounded-full transition-all ${
                          isDone ? 'bg-emerald-500/40' : 'bg-slate-800'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Live log terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/60">
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deployment Log</span>
            </div>
            <div className="h-40 overflow-y-auto p-4 space-y-1 font-mono text-[11px] scrollbar-thin scrollbar-thumb-slate-800">
              {currentLog.length === 0 ? (
                <span className="text-slate-600 animate-pulse">Initializing deployment pipeline…</span>
              ) : (
                currentLog.map((line, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      line.startsWith('✓') || line.startsWith('✅')
                        ? 'text-emerald-400'
                        : line.startsWith('$')
                        ? 'text-indigo-400'
                        : line.startsWith('Error') || line.startsWith('✗')
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {line || '\u00A0'}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Error message */}
          {overallStatus === 'error' && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-sm flex items-start gap-2.5">
              <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Deployment Failed</p>
                <p className="text-xs text-red-400/80 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success action */}
          {overallStatus === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold">Deployment Successful!</p>
                <p className="text-xs text-emerald-400/70 mt-0.5">
                  Redirecting to Applications…
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
