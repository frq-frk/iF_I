'use client'

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import { acceptConnectionRequest, rejectConnectionRequest, removeConnection } from '../actions';
import Link from 'next/link';
import { toast } from 'sonner';

function RequestSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="h-10 w-10 shrink-0 rounded-full animate-pulse-soft bg-white/[0.06]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="h-3 w-1/4 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-8 w-16 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function ConnectionsPage() {
  const user = useAppSelector(selectUser);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [tab, setTab] = useState('incoming');

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    async function fetchAll() {
      try {
        // Incoming requests
        const inSnap = await getDocs(query(
          collection(db, 'connectionRequests'),
          where('to', '==', user.uid),
        ));
        const inReqs = inSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Outgoing requests
        const outSnap = await getDocs(query(
          collection(db, 'connectionRequests'),
          where('from', '==', user.uid),
        ));
        const outReqs = outSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Hydrate with user profiles
        const allUids = [
          ...inReqs.map(r => r.from),
          ...outReqs.map(r => r.to),
        ];

        // Current connections
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const connIds = userSnap.exists() ? (userSnap.data().connections || []) : [];
        allUids.push(...connIds);

        const uniqueUids = [...new Set(allUids)];
        const profileMap = {};
        await Promise.all(
          uniqueUids.map(async (uid) => {
            try {
              const snap = await getDoc(doc(db, 'users', uid));
              if (snap.exists()) {
                profileMap[uid] = { uid, ...snap.data() };
              }
            } catch {}
          })
        );

        setIncoming(inReqs.map(r => ({ ...r, profile: profileMap[r.from] || { uid: r.from, displayName: r.from } })));
        setOutgoing(outReqs.map(r => ({ ...r, profile: profileMap[r.to] || { uid: r.to, displayName: r.to } })));
        setConnections(connIds.map(uid => profileMap[uid] || { uid, displayName: uid }));
      } catch (err) {
        console.error('Error fetching connections:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user]);

  const handleAccept = async (requestId, fromUid) => {
    setActionLoading(prev => ({ ...prev, [requestId]: 'accept' }));
    const res = await acceptConnectionRequest(user.uid, requestId);
    if (res.success) {
      toast.success('Connection accepted');
      setIncoming(prev => prev.filter(r => r.id !== requestId));
      const accepted = incoming.find(r => r.id === requestId);
      if (accepted?.profile) setConnections(prev => [...prev, accepted.profile]);
    } else {
      toast.error(res.error);
    }
    setActionLoading(prev => ({ ...prev, [requestId]: null }));
  };

  const handleReject = async (requestId) => {
    setActionLoading(prev => ({ ...prev, [requestId]: 'reject' }));
    const res = await rejectConnectionRequest(user.uid, requestId);
    if (res.success) {
      toast.success('Request declined');
      setIncoming(prev => prev.filter(r => r.id !== requestId));
    } else {
      toast.error(res.error);
    }
    setActionLoading(prev => ({ ...prev, [requestId]: null }));
  };

  const handleRemove = async (targetUid) => {
    setActionLoading(prev => ({ ...prev, [targetUid]: 'remove' }));
    const res = await removeConnection(user.uid, targetUid);
    if (res.success) {
      toast.success('Connection removed');
      setConnections(prev => prev.filter(c => c.uid !== targetUid));
    } else {
      toast.error(res.error);
    }
    setActionLoading(prev => ({ ...prev, [targetUid]: null }));
  };

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Sign in required</h2>
          <p className="mt-1 text-sm text-slate-500">Log in to manage your connections</p>
          <Link href="/login" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'incoming', label: 'Requests', count: incoming.length },
    { key: 'outgoing', label: 'Sent', count: outgoing.length },
    { key: 'connections', label: 'Connections', count: connections.length },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
          <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">Connections</h1>
        <p className="mt-2 text-sm text-slate-500">Manage your network and connection requests</p>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-white/[0.08] text-white'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold ${
                tab === t.key
                  ? t.key === 'incoming' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.08] text-slate-400'
                  : t.key === 'incoming' && t.count > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.04] text-slate-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <>
            <RequestSkeleton />
            <RequestSkeleton />
            <RequestSkeleton />
          </>
        ) : tab === 'incoming' ? (
          incoming.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
              title="No pending requests"
              subtitle="When someone sends you a connection request, it will appear here"
            />
          ) : (
            incoming.map(req => (
              <PersonCard key={req.id} profile={req.profile}>
                <button
                  onClick={() => handleAccept(req.id, req.from)}
                  disabled={!!actionLoading[req.id]}
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {actionLoading[req.id] === 'accept' ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={!!actionLoading[req.id]}
                  className="rounded-lg bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
                >
                  {actionLoading[req.id] === 'reject' ? 'Declining...' : 'Decline'}
                </button>
              </PersonCard>
            ))
          )
        ) : tab === 'outgoing' ? (
          outgoing.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              }
              title="No sent requests"
              subtitle="Connection requests you send will appear here until accepted"
            />
          ) : (
            outgoing.map(req => (
              <PersonCard key={req.id} profile={req.profile}>
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[0.6875rem] font-medium text-yellow-400">
                  Pending
                </span>
              </PersonCard>
            ))
          )
        ) : (
          connections.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
              title="No connections yet"
              subtitle="Visit other profiles and connect with fellow filmmakers"
            />
          ) : (
            connections.map(profile => (
              <PersonCard key={profile.uid} profile={profile}>
                <button
                  onClick={() => handleRemove(profile.uid)}
                  disabled={actionLoading[profile.uid] === 'remove'}
                  className="rounded-lg bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  {actionLoading[profile.uid] === 'remove' ? 'Removing...' : 'Remove'}
                </button>
              </PersonCard>
            ))
          )
        )}
      </div>
    </div>
  );
}

function PersonCard({ profile, children }) {
  const initial = (profile.displayName || '?')[0].toUpperCase();
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/[0.1] hover:bg-white/[0.03]">
      <Link href={`/user/${profile.uid}`} className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/[0.08] text-sm font-semibold text-indigo-300">
        {initial}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/user/${profile.uid}`} className="text-sm font-medium text-white hover:text-indigo-300 transition-colors truncate block">
          {profile.displayName || 'Unknown User'}
        </Link>
        {profile.bio && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{profile.bio}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}
