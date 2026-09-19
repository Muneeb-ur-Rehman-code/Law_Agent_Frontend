'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { getCaseById, getPreLitigationStatus, runPreLitigationAgent, getMedicalStatus, runMedicalCheck, getLitigationStatus, runLitigationAgent, getLemonLawStatus, runLemonLawAgent, runClientComms } from '@/lib/api';
import { LemonLawStatus, LitigationStatus, MedicalStatus, PreLitigationStatus, SingleCaseDetail } from '@/types';
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
  BrainCircuit,
  RefreshCw,
  Stethoscope,
  Gavel,
  Car,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SingleCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = Number(params?.id);

  const [caseDetail, setCaseDetail] = useState<SingleCaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preLitigationStatus, setPreLitigationStatus] = useState<PreLitigationStatus | null>(null);
  const [preLitigationLoading, setPreLitigationLoading] = useState(true);
  const [preLitigationError, setPreLitigationError] = useState<string | null>(null);
  const [isRunningPreLitigation, setIsRunningPreLitigation] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [medicalStatus, setMedicalStatus] = useState<MedicalStatus | null>(null);
  const [medicalLoading, setMedicalLoading] = useState(true);
  const [medicalError, setMedicalError] = useState<string | null>(null);
  const [isRunningMedical, setIsRunningMedical] = useState(false);
  const [litigationStatus, setLitigationStatus] = useState<LitigationStatus | null>(null);
  const [litigationLoading, setLitigationLoading] = useState(true);
  const [litigationError, setLitigationError] = useState<string | null>(null);
  const [isRunningLitigation, setIsRunningLitigation] = useState(false);
  const [lemonLawStatus, setLemonLawStatus] = useState<LemonLawStatus | null>(null);
  const [lemonLawLoading, setLemonLawLoading] = useState(false);
  const [lemonLawError, setLemonLawError] = useState<string | null>(null);
  const [isRunningLemonLaw, setIsRunningLemonLaw] = useState(false);
  const [isRunningComms, setIsRunningComms] = useState(false);
  const [commsError, setCommsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'docs' | 'tasks' | 'clients'>('clients');
  const user = getCurrentUser();
  const canRunPreLitigation = user ? ['admin', 'attorney'].includes(user.role) : false;
  const canRunCaseAgents = user ? ['admin', 'attorney'].includes(user.role) : false;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (caseId) {
      loadCaseDetail();
      loadPreLitigationStatus();
      loadMedicalStatus();
      loadLitigationStatus();
      if (isLemonLawCase()) loadLemonLawStatus();
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

  const loadPreLitigationStatus = async () => {
    try {
      setPreLitigationLoading(true);
      setPreLitigationError(null);
      setPreLitigationStatus(await getPreLitigationStatus(caseId));
    } catch (err) {
      console.error('Failed to load pre-litigation status:', err);
      setPreLitigationError(err instanceof Error ? err.message : 'Unable to load pre-litigation status.');
    } finally {
      setPreLitigationLoading(false);
    }
  };

  const handleRunPreLitigation = async () => {
    try {
      setIsRunningPreLitigation(true);
      setRunError(null);
      await runPreLitigationAgent(caseId);
      await loadPreLitigationStatus();
    } catch (err) {
      console.error('Failed to run pre-litigation agent:', err);
      setRunError(err instanceof Error ? err.message : 'Unable to run pre-litigation agent.');
    } finally {
      setIsRunningPreLitigation(false);
    }
  };

  const loadMedicalStatus = async () => {
    try {
      setMedicalLoading(true);
      setMedicalError(null);
      setMedicalStatus(await getMedicalStatus(caseId));
    } catch (err) {
      setMedicalError(err instanceof Error ? err.message : 'Unable to load medical monitoring status.');
    } finally {
      setMedicalLoading(false);
    }
  };

  const handleRunMedical = async () => {
    try {
      setIsRunningMedical(true);
      setMedicalError(null);
      await runMedicalCheck();
      await loadMedicalStatus();
    } catch (err) {
      setMedicalError(err instanceof Error ? err.message : 'Unable to run medical check.');
    } finally {
      setIsRunningMedical(false);
    }
  };

  const loadLitigationStatus = async () => {
    try {
      setLitigationLoading(true);
      setLitigationError(null);
      setLitigationStatus(await getLitigationStatus(caseId));
    } catch (err) {
      setLitigationError(err instanceof Error ? err.message : 'Unable to load litigation status.');
    } finally {
      setLitigationLoading(false);
    }
  };

  const handleRunLitigation = async () => {
    try {
      setIsRunningLitigation(true);
      setLitigationError(null);
      await runLitigationAgent(caseId);
      await loadLitigationStatus();
    } catch (err) {
      setLitigationError(err instanceof Error ? err.message : 'Unable to run litigation agent.');
    } finally {
      setIsRunningLitigation(false);
    }
  };

  const isLemonLawCase = () => {
    const value = String(caseDetail?.case.case_type || '').toLowerCase();
    return value.includes('lemon') || value === '2';
  };

  const loadLemonLawStatus = async () => {
    try {
      setLemonLawLoading(true);
      setLemonLawError(null);
      setLemonLawStatus(await getLemonLawStatus(caseId));
    } catch (err) {
      setLemonLawError(err instanceof Error ? err.message : 'Unable to load Lemon Law status.');
    } finally {
      setLemonLawLoading(false);
    }
  };

  const handleRunLemonLaw = async () => {
    try {
      setIsRunningLemonLaw(true);
      setLemonLawError(null);
      await runLemonLawAgent(caseId);
      await loadLemonLawStatus();
    } catch (err) {
      setLemonLawError(err instanceof Error ? err.message : 'Unable to run Lemon Law agent.');
    } finally {
      setIsRunningLemonLaw(false);
    }
  };

  const stageLabel = (stage?: string) => ({
    complaint_needed: 'Complaint Needed', discovery: 'Discovery', motion_pending: 'Motion Pending',
    deposition: 'Deposition', trial_prep: 'Trial Prep', settlement: 'Settlement',
  }[stage || ''] || 'Unknown');

  const daysUntil = (value: string) => Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);

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
  const clientMessages = notes.filter((note) => note.title?.toLowerCase().includes('client communication'));
  const lastClientMessage = clientMessages[0];
  const clientDays = lastClientMessage?.created_at ? Math.max(0, Math.floor((Date.now() - new Date(lastClientMessage.created_at).getTime()) / 86400000)) : null;
  const handleRunComms = async () => { try { setIsRunningComms(true); setCommsError(null); await runClientComms(caseId); await loadCaseDetail(); } catch (err) { setCommsError(err instanceof Error ? err.message : 'Unable to prepare client update.'); } finally { setIsRunningComms(false); } };

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

          <Card title="Pre-Litigation Status" subtitle="Personal-injury case readiness and next action">
            {preLitigationLoading ? (
              <div className="flex items-center gap-2 text-xs text-mid"><RefreshCw className="h-4 w-4 animate-spin text-gold" /> Loading agent status...</div>
            ) : preLitigationError ? (
              <div className="space-y-3">
                <p className="text-xs text-red-700">{preLitigationError}</p>
                <Button variant="secondary" size="sm" onClick={loadPreLitigationStatus}>Retry</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-mid">Medical Records</span>
                    <span className={`mt-1 block text-sm font-bold ${preLitigationStatus?.medical_records_status === 'up_to_date' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {preLitigationStatus?.medical_records_status === 'up_to_date' ? 'Up to date' : preLitigationStatus?.medical_records_status === 'overdue' ? 'Overdue' : 'Unknown'}
                    </span>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-mid">Demand Letter</span>
                    <span className="mt-1 block text-sm font-bold capitalize text-navy">{preLitigationStatus?.demand_letter_status?.replace('_', ' ') || 'Not ready'}</span>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-mid">Last Action</span>
                    <span className="mt-1 block text-sm font-bold text-navy">{preLitigationStatus?.last_action || 'No action recorded'}</span>
                    {preLitigationStatus?.last_action_at && <span className="mt-1 block text-[11px] text-mid">{new Date(preLitigationStatus.last_action_at).toLocaleString()}</span>}
                  </div>
                </div>
                {canRunPreLitigation && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                    <Button variant="primary" size="sm" onClick={handleRunPreLitigation} isLoading={isRunningPreLitigation}>
                      <BrainCircuit className="mr-1.5 h-4 w-4" /> Run Pre-Litigation Agent
                    </Button>
                    {runError && <span className="text-xs text-red-700">{runError}</span>}
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Medical Monitoring" subtitle="Treatment continuity and provider follow-up">
              {medicalLoading ? <div className="flex items-center gap-2 text-xs text-mid"><RefreshCw className="h-4 w-4 animate-spin text-gold" /> Loading medical status...</div> : medicalError ? <div className="space-y-3"><p className="text-xs text-red-700">{medicalError}</p><Button variant="secondary" size="sm" onClick={loadMedicalStatus}>Retry</Button></div> : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3"><Stethoscope className="mt-0.5 h-5 w-5 text-gold" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-mid">Medical providers</p><p className="mt-1 text-sm font-semibold text-navy">{medicalStatus?.providers?.join(', ') || clients.map((client) => client.medical_provider).filter(Boolean).join(', ') || 'No provider listed'}</p></div></div>
                  <div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-mid">Days since last update: <strong className="text-navy">{medicalStatus?.days_since_update ?? 'Unknown'}</strong></span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${medicalStatus?.status === 'ok' ? 'bg-emerald-100 text-emerald-800' : medicalStatus?.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{medicalStatus?.status === 'ok' ? 'OK' : medicalStatus?.status === 'overdue' ? 'Overdue' : medicalStatus?.status === 'follow_up_needed' ? 'Follow-up Needed' : 'Unknown'}</span></div>
                  <p className="text-[11px] text-mid">Last monitoring check: {medicalStatus?.last_monitoring_check ? new Date(medicalStatus.last_monitoring_check).toLocaleString() : 'Not recorded'}</p>
                  {canRunCaseAgents && <Button variant="primary" size="sm" onClick={handleRunMedical} isLoading={isRunningMedical}><Stethoscope className="mr-1.5 h-4 w-4" /> Run Medical Check</Button>}
                </div>
              )}
            </Card>

            <Card title="Litigation Status" subtitle="Current stage, recommended action, and court calendar">
              {litigationLoading ? <div className="flex items-center gap-2 text-xs text-mid"><RefreshCw className="h-4 w-4 animate-spin text-gold" /> Loading litigation status...</div> : litigationError ? <div className="space-y-3"><p className="text-xs text-red-700">{litigationError}</p><Button variant="secondary" size="sm" onClick={loadLitigationStatus}>Retry</Button></div> : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2"><Gavel className="h-5 w-5 text-gold" /><span className="rounded-full bg-navy px-2.5 py-1 text-[10px] font-bold text-white">{stageLabel(litigationStatus?.stage)}</span></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-mid">Next action</p><p className="mt-1 text-sm font-semibold text-navy">{litigationStatus?.next_action || 'No recommendation recorded.'}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-mid">Upcoming court dates</p>{litigationStatus?.upcoming_events?.length ? <div className="mt-2 space-y-2">{litigationStatus.upcoming_events.map((event) => <div key={event.id} className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-xs"><span className="font-semibold text-blue-900">{event.title}</span><span className="font-bold text-blue-800">{daysUntil(event.start_date) <= 0 ? 'Today' : `${daysUntil(event.start_date)} days`}</span></div>)}</div> : <p className="mt-1 text-xs text-mid">No upcoming court dates.</p>}</div>
                  {canRunCaseAgents && <Button variant="primary" size="sm" onClick={handleRunLitigation} isLoading={isRunningLitigation}><Gavel className="mr-1.5 h-4 w-4" /> Run Litigation Agent</Button>}
                </div>
              )}
            </Card>
          </div>

          {isLemonLawCase() && (
            <Card title="Lemon Law Status" subtitle="California statutory threshold and manufacturer communications">
              {lemonLawLoading ? <div className="flex items-center gap-2 text-xs text-mid"><RefreshCw className="h-4 w-4 animate-spin text-gold" /> Loading Lemon Law status...</div> : lemonLawError ? <div className="space-y-3"><p className="text-xs text-red-700">{lemonLawError}</p><Button variant="secondary" size="sm" onClick={loadLemonLawStatus}>Retry</Button></div> : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3"><Car className="h-5 w-5 text-gold" /><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${lemonLawStatus?.threshold_status === 'demand_sent' ? 'bg-emerald-100 text-emerald-800' : lemonLawStatus?.threshold_status === 'met_demand_ready' ? 'bg-gold-light text-amber-900' : 'bg-gray-100 text-gray-700'}`}>{lemonLawStatus?.threshold_status === 'demand_sent' ? 'Demand Sent' : lemonLawStatus?.threshold_status === 'met_demand_ready' ? 'Met — Demand Ready' : 'Not Met'}</span></div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs"><span className="block text-[10px] font-bold uppercase tracking-wider text-mid">Repair attempts</span><strong className="mt-1 block text-sm text-navy">{lemonLawStatus?.repair_attempts ?? 'Not available'}</strong></div><div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs"><span className="block text-[10px] font-bold uppercase tracking-wider text-mid">Days out of service</span><strong className="mt-1 block text-sm text-navy">{lemonLawStatus?.days_out_of_service ?? 'Not available'}</strong></div></div>
                  <div className="grid grid-cols-1 gap-2 text-xs text-mid"><span>Manufacturer: <strong className="text-navy">{lemonLawStatus?.manufacturer_name || 'Not listed'}</strong></span><span>Last manufacturer communication: <strong className="text-navy">{lemonLawStatus?.last_manufacturer_communication ? new Date(lemonLawStatus.last_manufacturer_communication).toLocaleString() : 'Not recorded'}</strong></span></div>
                  {canRunCaseAgents && <Button variant="primary" size="sm" onClick={handleRunLemonLaw} isLoading={isRunningLemonLaw}><Car className="mr-1.5 h-4 w-4" /> Run Lemon Law Agent</Button>}
                </div>
              )}
            </Card>
          )}

          <Card title="Client Communications" subtitle="Attorney-approved updates sent to the client">
            <div className="space-y-4">
              <div className="flex items-center gap-3"><MessageCircle className="h-5 w-5 text-gold" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-mid">Last message sent</p><p className="text-sm font-semibold text-navy">{lastClientMessage?.created_at ? new Date(lastClientMessage.created_at).toLocaleString() : 'No client update recorded'}</p></div></div>
              <p className={`text-sm font-bold ${clientDays === null || clientDays > 14 ? 'text-red-700' : clientDays >= 7 ? 'text-orange-700' : 'text-emerald-700'}`}>{clientDays === null ? 'No prior contact' : `${clientDays} days since last contact`}</p>
              {lastClientMessage?.text && <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs leading-relaxed text-dark">{lastClientMessage.text}</div>}
              <Button variant="primary" size="sm" onClick={handleRunComms} isLoading={isRunningComms}><MessageCircle className="mr-1.5 h-4 w-4" /> Send Update</Button>
              {commsError && <p className="text-xs text-red-700">{commsError}</p>}
            </div>
          </Card>

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
