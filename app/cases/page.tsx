'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { CaseCard } from '@/components/CaseCard';
import { getCases } from '@/lib/api';
import { Case } from '@/types';
import { Search, Filter, Folder } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadCases();
  }, [router]);

  useEffect(() => {
    let result = [...cases];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.case_number?.toString().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'open') {
      result = result.filter((c) => !c.closed_date);
    } else if (statusFilter === 'closed') {
      result = result.filter((c) => !!c.closed_date);
    }

    setFilteredCases(result);
  }, [cases, searchQuery, statusFilter]);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const data = await getCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title="Active Cases Directory" />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Folder className="w-5 h-5 text-gold" />
                Case Management Directory
              </h2>
              <p className="text-xs text-mid mt-0.5">
                Active Personal Injury and Lemon Law cases from law_office database
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-64">
                <Input
                  placeholder="Search case # or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-1.5 text-xs"
                />
              </div>

              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    statusFilter === 'all' ? 'bg-navy text-white shadow-sm' : 'text-mid hover:text-navy'
                  }`}
                >
                  All ({cases.length})
                </button>
                <button
                  onClick={() => setStatusFilter('open')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    statusFilter === 'open' ? 'bg-navy text-white shadow-sm' : 'text-mid hover:text-navy'
                  }`}
                >
                  Open ({cases.filter((c) => !c.closed_date).length})
                </button>
                <button
                  onClick={() => setStatusFilter('closed')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    statusFilter === 'closed' ? 'bg-navy text-white shadow-sm' : 'text-mid hover:text-navy'
                  }`}
                >
                  Closed ({cases.filter((c) => !!c.closed_date).length})
                </button>
              </div>
            </div>
          </div>

          {/* Cases Grid */}
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-xl text-xs text-mid animate-pulse">
              Loading active cases...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-200">
              <p className="text-xs font-semibold text-mid">No matching cases found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCases.map((c) => (
                <CaseCard key={c.id} caseData={c} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
