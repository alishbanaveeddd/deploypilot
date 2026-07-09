'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Terminal, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to authenticate user.');
      }

      // Save token & user profile locally
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('profileEmail', result.user.email);
      localStorage.setItem('profileName', result.user.name);

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic background highlights */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 animate-bounce">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            DeployPilot
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to manage your Kubernetes deployments
          </p>
        </div>

        {/* Auth form card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 shadow-xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-sm flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email input */}
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...register('email')}
                  className={`w-full bg-slate-950/60 border ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                  } text-white rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...register('password')}
                  className={`w-full bg-slate-950/60 border ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-800 focus:border-indigo-500'
                  } text-white rounded-lg pl-11 pr-11 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-600`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-red-400" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Social login mock */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 border-t border-slate-800 pointer-events-none" />
            <span className="relative bg-slate-900 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Or continue with
            </span>
          </div>

          <button
            type="button"
            className="w-full h-10 border border-slate-850 hover:border-slate-750 bg-slate-950/40 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <svg className="h-4 w-4 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Support links */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Don&apos;t have an account?{' '}
          <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Contact admin
          </a>
        </p>
      </div>
    </div>
  );
}
