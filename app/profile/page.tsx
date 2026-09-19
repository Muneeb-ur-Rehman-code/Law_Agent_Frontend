'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, UserCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { changePassword } from '@/lib/api';
import { Toast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => { if (!isAuthenticated()) router.push('/login'); }, [router]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) { setStatus({ type: 'error', text: 'New passwords do not match' }); return; }
    try { setIsSaving(true); setStatus(null); await changePassword(currentPassword, newPassword); setStatus({ type: 'success', text: 'Password updated' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }
    catch (error) { setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Current password incorrect' }); }
    finally { setIsSaving(false); }
  };
  return <div className="flex min-h-screen bg-light-gray"><Sidebar /><div className="min-w-0 flex-1"><Navbar title="Profile" /><main className="mx-auto max-w-4xl space-y-6 p-6">
    <Card title="Account Information"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-xl font-bold text-navy"><UserCircle /></div><div><h2 className="text-lg font-bold text-navy">{user?.first_name} {user?.last_name}</h2><p className="text-sm text-mid">{user?.email}</p><div className="mt-2 flex gap-2"><span className="rounded-full bg-navy px-2 py-1 text-[10px] font-bold uppercase text-gold">{user?.role}</span><span className="rounded-full bg-gold-light px-2 py-1 text-[10px] font-bold uppercase text-amber-900">{user?.practice_area}</span></div></div></div></Card>
    <Card title="Change Password" subtitle="Use a unique password for your account"><form onSubmit={submit} className="max-w-md space-y-4"><Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /><Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} /><Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />{status && <p className={status.type === 'success' ? 'text-xs font-semibold text-emerald-700' : 'text-xs font-semibold text-red-700'}>{status.text}</p>}<Button type="submit" isLoading={isSaving}><KeyRound className="mr-1.5 h-4 w-4" /> Update Password</Button></form></Card>
  </main></div><Toast message={status?.type === 'success' ? status.text : null} kind="success" onClose={() => setStatus(null)} /></div>;
}
