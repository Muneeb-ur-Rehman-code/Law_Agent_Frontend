'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { getCaseById } from '@/lib/api';
import { SingleCaseDetail } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckSquare,
  Clock,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function SingleCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = Number(params?.id);

  const [caseDetail, setCaseDetail] = useState<SingleCaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'docs' | 'tasks' | 'clients'>('clients');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (caseId) {
      loadCaseDetail();
    }
  }, [caseId, router]);

  const loadCaseDetail = async () => {
    try {
      setIsLoading(true);
      const data = await getCaseById(caseId);
      setCaseDetail(data);
    } catch (err) {
      console.error('Failed to load case detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-light-gray">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar title="Case Overview" />
          <main className="p-6 text-center text-xs text-mid animate-pulse">Loading case data...</main>
        </div>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="flex h-screen bg-light-gray">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar title="Case Overview" />
          <main className="p-6">
            <Card className="text-center py-12">
              <p className="text-sm font-semibold text-danger">Case not found</p>
              <Link href="/cases" className="text-xs text-navy underline mt-2 block">
                Back to Cases
              </Link>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const { case: c, clients, notes, documents, tasks } = caseDetail;

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title={`Case #${c.case_number || c.id} — Details`} />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Back Navigation Button */}
          <Link
            href="/cases"
            className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cases Directory
          </Link>

          {/* Case Header Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold bg-navy text-gold px-2.5 py-0.5 rounded">
                    Case #{c.case_number || c.id}
                  </span>
                  {c.closed_date ? <Badge variant="idle">Closed</Badge> : <Badge variant="running">Active</Badge>}
                </div>
                <h1 className="text-xl font-extrabold text-navy">{c.title || `Case #${c.id}`}</h1>
              </div>

              {c.last_date_to_file_claim && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-3 text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <div className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
                      Statute of Limitations
                    </div>
                    <div className="font-extrabold text-sm">{c.last_date_to_file_claim}</div>
                  </div>
                </div>
              )}
            </div>

            {c.description && <p className="text-xs text-mid leading-relaxed">{c.description}</p>}

            {/* Key Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 font-medium block">Filed On:</span>
                <span className="font-bold text-navy">{c.filed_on || 'Pending'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Date of Loss:</span>
                <span className="font-bold text-navy">{c.loss_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Court Case #:</span>
                <span className="font-bold text-navy">{c.court_case_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Bill Type:</span>
                <span className="font-bold text-navy">{c.bill_type || 'Standard'}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold text-navy">
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-5 py-3 flex items-center gap-2 border-b-2 font-bold transition-colors ${
                  activeTab === 'clients' ? 'border-navy bg-white text-navy' : 'border-transparent text-mid hover:text-navy'
                }`}
              >
                <User className="w-4 h-4 text-gold" /> Clients ({clients.length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-5 py-3 flex items-center gap-2 border-b-2 font-bold transition-colors ${
                  activeTab === 'notes' ? 'border-navy bg-white text-navy' : 'border-transparent text-mid hover:text-navy'
                }`}
              >
                <Clock className="w-4 h-4 text-gold" /> Notes & Activity ({notes.length})
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-5 py-3 flex items-center gap-2 border-b-2 font-bold transition-colors ${
                  activeTab === 'docs' ? 'border-navy bg-white text-navy' : 'border-transparent text-mid hover:text-navy'
                }`}
              >
                <FileText className="w-4 h-4 text-gold" /> Documents ({documents.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-5 py-3 flex items-center gap-2 border-b-2 font-bold transition-colors ${
                  activeTab === 'tasks' ? 'border-navy bg-white text-navy' : 'border-transparent text-mid hover:text-navy'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-gold" /> Pending Tasks ({tasks.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6">
              {activeTab === 'clients' && (
                <div className="space-y-4">
                  {clients.length === 0 ? (
                    <p className="text-xs text-mid italic">No client profile linked to this case.</p>
                  ) : (
                    clients.map((cli) => (
                      <div key={cli.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                        <h4 className="font-bold text-navy text-sm">
                          {cli.first_name} {cli.last_name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-mid">
                          {cli.email && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-gold" /> {cli.email}
                            </span>
                          )}
                          {cli.mobile_phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gold" /> {cli.mobile_phone}
                            </span>
                          )}
                          {cli.home_address && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gold" /> {cli.home_address}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <p className="text-xs text-mid italic">No communication notes logged for this case.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 text-xs space-y-1">
                        <div className="flex items-center justify-between font-semibold text-navy">
                          <span>{n.title || 'Note'}</span>
                          <span className="text-gray-400 font-normal">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-dark leading-relaxed">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'docs' && (
                <div className="space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-xs text-mid italic">No documents attached.</p>
                  ) : (
                    documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 text-xs">
                        <span className="font-semibold text-navy flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gold" /> {doc.name || doc.server_name}
                        </span>
                        <span className="text-gray-400">{doc.ext || 'File'}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-mid italic">No pending tasks for this case.</p>
                  ) : (
                    tasks.map((t) => (
                      <div key={t.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 text-xs flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-navy">{t.title}</h5>
                          {t.text && <p className="text-mid mt-0.5">{t.text}</p>}
                        </div>
                        {t.deadline && <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">Due: {t.deadline}</span>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
