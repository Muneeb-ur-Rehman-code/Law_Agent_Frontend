'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { Scale, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-navy-light/30 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold to-amber-500 text-navy shadow-xl mb-4 transform hover:scale-105 transition-transform">
            <Scale className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            MARJIYA LAW PC
          </h1>
          <p className="mt-1 text-sm text-gold font-medium tracking-widest uppercase">
            AI Multi-Agent Operating System
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100/20 backdrop-blur-lg">
          <h2 className="text-lg font-bold text-navy mb-6 text-center">
            Sign In to Attorney Portal
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-danger" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@marjiya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              className="w-full mt-2 font-bold shadow-lg shadow-gold/20"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Pre-filled Hint */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-[11px] text-mid">
              Staff & Attorney Portal — West Covina, CA
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Contact Bassam Marjiya for account provisioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
