'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AgentStatusCard } from '@/components/AgentStatusCard';
import { getAgentStatus, triggerAgent } from '@/lib/api';
import { AgentStatusResponse } from '@/types';
import { Cpu, Activity, Play } from 'lucide-react';

export default function AgentsPage() {
  const router = useRouter();
  const [agentsData, setAgentsData] = useState<AgentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [triggeringAgent, setTriggeringAgent] = useState<string | null>(null);

  const user = getCurrentUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadAgents();
  }, [router]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const data = await getAgentStatus();
      setAgentsData(data);
    } catch (err) {
      console.error('Failed to fetch agent status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrigger = async (agentName: string) => {
    setTriggeringAgent(agentName);
    try {
      await triggerAgent(agentName);
      await loadAgents();
    } catch (err) {
      console.error('Trigger agent failed:', err);
    } finally {
      setTriggeringAgent(null);
    }
  };

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title="AI Multi-Agent Monitor" />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Summary */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Cpu className="w-5 h-5 text-gold" />
                System AI Agents Registry
              </h2>
              <p className="text-xs text-mid mt-0.5">
                Monitoring 12 autonomous AI agents running legal, intake, and litigation tasks
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold bg-gray-50 px-4 py-2 rounded-lg border">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active: {agentsData?.active ?? 0}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-navy">Total Registered: {agentsData?.total ?? 12}</span>
            </div>
          </div>

          {/* Agents Grid */}
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-xl text-xs text-mid animate-pulse">
              Loading AI agent system status...
            </div>
          ) : agentsData?.agents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(agentsData.agents).map(([name, info]) => (
                <AgentStatusCard
                  key={name}
                  name={name}
                  agentInfo={info}
                  onTrigger={handleTrigger}
                  canTrigger={isAdmin}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
              <p className="text-xs text-mid">Unable to fetch agent status.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
