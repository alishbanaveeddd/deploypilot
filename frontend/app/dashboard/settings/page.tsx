'use client';

import React, { useState } from 'react';
import {
  User,
  Settings,
  Cpu,
  Palette,
  Key,
  Database,
  Save,
  Loader2,
  CheckCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const [profileName, setProfileName] = useState('Pilot Admin');
  const [profileEmail, setProfileEmail] = useState('admin@deploypilot.com');
  const [theme, setTheme] = useState('dark');
  const [apiUrl, setApiUrl] = useState('http://localhost:3000');
  const [k8sNamespace, setK8sNamespace] = useState('default');
  const [colorTheme, setColorTheme] = useState('indigo');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfileName(localStorage.getItem('profileName') || 'Pilot Admin');
      setProfileEmail(localStorage.getItem('profileEmail') || 'admin@deploypilot.com');
      setApiUrl(localStorage.getItem('apiUrl') || 'http://localhost:3000');
      setK8sNamespace(localStorage.getItem('k8sNamespace') || 'default');
      setTheme(localStorage.getItem('theme') || 'dark');
      setColorTheme(localStorage.getItem('colorTheme') || 'indigo');
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileName', profileName);
      localStorage.setItem('profileEmail', profileEmail);
      localStorage.setItem('apiUrl', apiUrl);
      localStorage.setItem('k8sNamespace', k8sNamespace);
      localStorage.setItem('theme', theme);
      localStorage.setItem('colorTheme', colorTheme);

      // Notify same-tab listeners (native storage events only fire cross-tab)
      window.dispatchEvent(new StorageEvent('storage', { key: 'k8sNamespace', newValue: k8sNamespace }));

      // Toggle document class
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }

      // Update color theme class
      document.documentElement.classList.remove('theme-indigo', 'theme-emerald', 'theme-amber');
      document.documentElement.classList.add('theme-' + colorTheme);
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure DeployPilot credentials, cluster contexts, and client themes.</p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: User Profile */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-850/60">
            <User className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">User Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-855 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-855 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Cluster Setup */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-850/60">
            <Database className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Cluster Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Backend API URL
              </label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-855 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Default Namespace
              </label>
              <input
                type="text"
                value={k8sNamespace}
                onChange={(e) => setK8sNamespace(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-855 focus:border-indigo-500 text-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Themes styling */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-850/60">
            <Palette className="h-5 w-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Appearance</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Color Mode
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'dark', label: 'Dark Mode' },
                  { id: 'light', label: 'Light Mode' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`flex-1 px-4 py-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      item.id === theme
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-350'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Accent Theme Color
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'indigo', label: 'Indigo (Default)', color: 'bg-indigo-500' },
                  { id: 'emerald', label: 'Emerald Mint', color: 'bg-emerald-500' },
                  { id: 'amber', label: 'Amber Gold', color: 'bg-amber-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setColorTheme(item.id)}
                    className={`flex-1 px-4 py-3 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      item.id === colorTheme
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                        : 'bg-slate-950/40 border-slate-850 text-slate-450 hover:text-slate-300'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-emerald-450 text-sm font-semibold animate-pulse">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
              Settings updated successfully
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
