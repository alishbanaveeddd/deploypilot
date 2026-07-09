import React from 'react';
import Link from 'next/link';
import { Terminal, Cpu, HardDrive, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 bg-slate-950 text-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Terminal className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              DeployPilot
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>
          <Link
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-md hover:shadow-indigo-500/20 flex items-center gap-1.5"
          >
            Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Main hero section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-400 text-xs font-semibold mb-8 animate-pulse">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400" />
          v1.0.0 Alpha Released
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Deploy GitHub Repos to
          <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Kubernetes with One Click.
          </span>
        </h1>

        <p className="max-w-2xl text-slate-400 text-lg md:text-xl mb-10 leading-relaxed">
          DeployPilot is a production-grade Platform-as-a-Service that simplifies cluster management.
          Connect your repository, configure environment variables, and let us handle build, orchestration, and scaling.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full mb-20">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3.5 rounded-lg shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 text-base group"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-base"
          >
            Sign In to Console
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Automated Builds</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We automatically clone your repository, bundle dependencies, and build optimized Docker containers on demand.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HardDrive className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Kubernetes Orchestration</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generates clean Deployment and Service manifests dynamically. Apply configurations with high durability and load balancing.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
            <div className="h-10 w-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Real-Time Insights</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor active cluster resources, inspect live logs from container pods, scale instances dynamically, and trigger rollouts.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} DeployPilot. All rights reserved. Powered by Next.js & Kubernetes.</p>
      </footer>
    </div>
  );
}
