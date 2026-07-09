'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  GitBranch,
  Layers,
  Cpu,
  HardDrive,
  Plus,
  Trash2,
  Activity,
  Info,
  Box,
} from 'lucide-react';
import DeployProgressModal from '@/components/deploy-progress-modal';
import { deployApplication } from '@/services/api';

// ─── Zod Schema ─────────────────────────────────────────────────────────────
const deploySchema = z.object({
  repoUrl: z
    .string()
    .min(1, 'Repository URL is required')
    .url('Must be a valid URL (e.g. https://github.com/user/repo)'),
  appName: z
    .string()
    .min(2, 'App name must be at least 2 characters')
    .max(48, 'App name cannot exceed 48 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  branch: z.string().min(1, 'Branch is required'),
  replicas: z.number().min(1, 'Min 1').max(20, 'Max 20'),
  containerPort: z.number().min(1).max(65535),
  servicePort: z.number().min(1).max(65535),
  cpu: z.string().optional(),
  memory: z.string().optional(),
  healthCheckPath: z.string().optional(),
  env: z.array(
    z.object({
      name: z.string().min(1, 'Key required'),
      value: z.string(),
    })
  ),
});

type DeployFormValues = z.infer<typeof deploySchema>;

// ─── Sub-component: Section Header ──────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="h-9 w-9 rounded-lg bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-indigo-400">{icon}</span>
      </div>
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Sub-component: Form Field ───────────────────────────────────────────────
function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-350 uppercase tracking-wider">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="h-3 w-3" /> {hint}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
        <span className="inline-block h-1 w-1 rounded-full bg-red-400" />{error}
      </p>}
    </div>
  );
}

// ─── Input styling helper ────────────────────────────────────────────────────
function inputCls(hasError?: boolean) {
  return `w-full bg-slate-950/60 border ${
    hasError ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
  } text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 font-mono`;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DeployPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DeployFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(deploySchema) as any,
    defaultValues: {
      repoUrl: '',
      appName: '',
      branch: 'main',
      replicas: 1,
      containerPort: 3000,
      servicePort: 80,
      cpu: '250m',
      memory: '256Mi',
      healthCheckPath: '',
      env: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'env' });

  const watchedValues = watch();

  const onSubmit = async () => {
    setDeployError(null);
    setShowModal(true);
  };

  const handleDeploy = async () => {
    await deployApplication({
      repoUrl: watchedValues.repoUrl,
      appName: watchedValues.appName,
      branch: watchedValues.branch,
      replicas: watchedValues.replicas,
      containerPort: watchedValues.containerPort,
      servicePort: watchedValues.servicePort,
      resources: {
        cpuLimit: watchedValues.cpu,
        memoryLimit: watchedValues.memory,
      },
      env: watchedValues.env,
      healthCheck: watchedValues.healthCheckPath
        ? { path: watchedValues.healthCheckPath }
        : undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Deploy Application</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure your deployment. We'll clone, build, and orchestrate everything automatically.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Section 1: Repository */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm">
          <SectionHeader
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            }
            title="Repository"
            subtitle="GitHub repository to clone and deploy"
          />
          <div className="space-y-4">
            <FormField label="Repository URL" htmlFor="repoUrl" error={errors.repoUrl?.message}>
              <input
                id="repoUrl"
                type="url"
                placeholder="https://github.com/username/my-app"
                {...register('repoUrl')}
                className={inputCls(!!errors.repoUrl)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Application Name" htmlFor="appName" error={errors.appName?.message} hint="lowercase, hyphens only">
                <input
                  id="appName"
                  type="text"
                  placeholder="my-app"
                  {...register('appName')}
                  className={inputCls(!!errors.appName)}
                />
              </FormField>

              <FormField label="Branch" htmlFor="branch" error={errors.branch?.message}>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <GitBranch className="h-4 w-4" />
                  </span>
                  <input
                    id="branch"
                    type="text"
                    placeholder="main"
                    {...register('branch')}
                    className={`${inputCls(!!errors.branch)} pl-9`}
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Section 2: Scaling */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm">
          <SectionHeader
            icon={<Layers className="h-4.5 w-4.5" />}
            title="Scaling & Ports"
            subtitle="Configure replicas and networking"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Replicas" htmlFor="replicas" error={errors.replicas?.message} hint="1–20">
              <input
                id="replicas"
                type="number"
                min={1}
                max={20}
                {...register('replicas', { valueAsNumber: true })}
                className={inputCls(!!errors.replicas)}
              />
            </FormField>
            <FormField label="Container Port" htmlFor="containerPort" error={errors.containerPort?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Box className="h-4 w-4" />
                </span>
                <input
                  id="containerPort"
                  type="number"
                  {...register('containerPort', { valueAsNumber: true })}
                  className={`${inputCls(!!errors.containerPort)} pl-9`}
                />
              </div>
            </FormField>
            <FormField label="Service Port" htmlFor="servicePort" error={errors.servicePort?.message}>
              <input
                id="servicePort"
                type="number"
                {...register('servicePort', { valueAsNumber: true })}
                className={inputCls(!!errors.servicePort)}
              />
            </FormField>
          </div>
        </div>

        {/* Section 3: Resources */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm">
          <SectionHeader
            icon={<Cpu className="h-4.5 w-4.5" />}
            title="Resource Limits"
            subtitle="Kubernetes CPU and memory constraints"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="CPU Limit" htmlFor="cpu" hint="e.g. 250m, 500m, 1">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Cpu className="h-4 w-4" />
                </span>
                <input
                  id="cpu"
                  type="text"
                  placeholder="250m"
                  {...register('cpu')}
                  className={`${inputCls()} pl-9`}
                />
              </div>
            </FormField>
            <FormField label="Memory Limit" htmlFor="memory" hint="e.g. 256Mi, 512Mi, 1Gi">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <HardDrive className="h-4 w-4" />
                </span>
                <input
                  id="memory"
                  type="text"
                  placeholder="256Mi"
                  {...register('memory')}
                  className={`${inputCls()} pl-9`}
                />
              </div>
            </FormField>
          </div>
        </div>

        {/* Section 4: Environment Variables */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm">
          <SectionHeader
            icon={<Activity className="h-4.5 w-4.5" />}
            title="Environment Variables"
            subtitle="Injected as Kubernetes ConfigMap entries"
          />

          <div className="space-y-2.5 mb-4">
            {fields.length === 0 && (
              <div className="text-center py-6 text-slate-600 text-sm border border-dashed border-slate-800 rounded-xl">
                No environment variables configured.
              </div>
            )}
            {fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="KEY_NAME"
                    {...register(`env.${idx}.name`)}
                    className={`${inputCls(!!errors.env?.[idx]?.name)} uppercase font-mono`}
                  />
                  {errors.env?.[idx]?.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.env[idx]?.name?.message}</p>
                  )}
                </div>
                <span className="text-slate-600 pt-2.5 text-lg shrink-0">=</span>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="value"
                    {...register(`env.${idx}.value`)}
                    className={inputCls()}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="mt-0.5 p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ name: '', value: '' })}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/20 hover:border-indigo-500/30 px-3.5 py-2 rounded-lg transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Variable
          </button>
        </div>

        {/* Section 5: Health Check */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm">
          <SectionHeader
            icon={<Activity className="h-4.5 w-4.5" />}
            title="Health Check"
            subtitle="Liveness and readiness probe HTTP endpoint"
          />
          <FormField label="Health Check Path" htmlFor="healthCheckPath" hint="optional (e.g. /healthy, /ready)">
            <input
              id="healthCheckPath"
              type="text"
              placeholder="/health"
              {...register('healthCheckPath')}
              className={inputCls()}
            />
            <p className="text-[10px] text-slate-500 mt-1.5 font-medium leading-normal">
              Leave this blank to disable probes entirely, or set to the specific path served by your container (e.g. <code>/healthy</code> for KUARD). If probes are mismatched, Kubernetes will restart the pods, causing a deployment timeout.
            </p>
          </FormField>
        </div>

        {/* Deploy Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-13 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/30 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>🚀</span>
          Deploy to Kubernetes
        </button>

        {deployError && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-sm">
            {deployError}
          </div>
        )}
      </form>

      {/* Progress Modal */}
      {showModal && (
        <DeployProgressModal
          config={{
            repoUrl: watchedValues.repoUrl,
            appName: watchedValues.appName,
            branch: watchedValues.branch,
            replicas: watchedValues.replicas,
            containerPort: watchedValues.containerPort,
            servicePort: watchedValues.servicePort,
            resources: {
              cpuLimit: watchedValues.cpu,
              memoryLimit: watchedValues.memory,
            },
            env: watchedValues.env,
            healthCheck: watchedValues.healthCheckPath
              ? { path: watchedValues.healthCheckPath }
              : undefined,
            namespace: typeof window !== 'undefined' ? (localStorage.getItem('k8sNamespace') || 'default') : 'default',
          }}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            router.push('/dashboard/applications');
          }}
          onError={(msg) => {
            setDeployError(msg);
          }}
        />
      )}
    </div>
  );
}
