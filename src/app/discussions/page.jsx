'use client'

import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';

const visibilityLabels = {
  anonymous: { label: 'Public', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  members: { label: 'Members', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  network: { label: 'Network', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

function DiscussionSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="h-5 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.06]" />
      <div className="mt-3 h-3 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
      <div className="mt-2 h-3 w-1/2 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      <div className="mt-4 flex gap-3">
        <div className="h-5 w-16 rounded-full animate-pulse-soft bg-white/[0.04]" />
        <div className="h-5 w-20 rounded-full animate-pulse-soft bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'discussions'), orderBy('createdAt', 'desc')));
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Batch-fetch author names
        const authorIds = [...new Set(items.map(d => d.authorId).filter(Boolean))];
        const nameMap = {};
        await Promise.all(authorIds.map(async (uid) => {
          try {
            const s = await getDoc(doc(db, 'users', uid));
            if (s.exists()) nameMap[uid] = s.data().displayName || null;
          } catch {}
        }));

        setDiscussions(items.map(d => ({ ...d, authorName: nameMap[d.authorId] || null })));
      } catch (err) {
        console.error('Error fetching discussions:', err);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setCreating(true);

    const form = new FormData(e.target);
    const title = form.get('title');
    const body = form.get('body');
    const visibility = form.get('visibility');

    try {
      const { addDoc, serverTimestamp } = await import('firebase/firestore');
      const docRef = await addDoc(collection(db, 'discussions'), {
        title,
        body,
        visibility,
        authorId: user.uid,
        authorName: user.displayName || null,
        replyCount: 0,
        createdAt: serverTimestamp(),
      });
      setDiscussions(prev => [{
        id: docRef.id, title, body, visibility,
        authorId: user.uid, authorName: user.displayName || null,
        replyCount: 0, createdAt: new Date(),
      }, ...prev]);
      setShowNew(false);
      e.target.reset();
    } catch (err) {
      console.error('Error creating discussion:', err);
    }
    setCreating(false);
  };

  function formatTime(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Discussions</h1>
          <p className="mt-1 text-sm text-slate-500">Community threads and conversations</p>
        </div>
        {user && (
          <button
            onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Thread
          </button>
        )}
      </div>

      {/* New thread form */}
      {showNew && user && (
        <form onSubmit={handleCreate} className="mt-6 rounded-2xl border border-indigo-500/20 bg-white/[0.02] p-5 space-y-4">
          <input
            name="title"
            type="text"
            placeholder="Thread title"
            required
            className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
          />
          <textarea
            name="body"
            placeholder="What's on your mind?"
            required
            rows="4"
            className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500">Visibility</label>
              <select
                name="visibility"
                defaultValue="anonymous"
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500/50"
              >
                <option value="anonymous">Public</option>
                <option value="members">Members Only</option>
                <option value="network">My Network</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-white/[0.06]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                {creating ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Discussion list */}
      <div className="mt-8 space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <DiscussionSkeleton key={i} />)
        ) : discussions.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">No discussions yet</h3>
            <p className="mt-2 text-sm text-slate-500">Start a conversation by creating the first thread.</p>
          </div>
        ) : (
          discussions.map(d => (
            <Link
              key={d.id}
              href={`/discussion/${d.id}`}
              className="block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[0.9375rem] font-semibold text-white line-clamp-1">{d.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400 line-clamp-2">{d.body}</p>
                </div>
                {d.replyCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    {d.replyCount}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className={`inline-flex rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium ${visibilityLabels[d.visibility]?.color || visibilityLabels.anonymous.color}`}>
                  {visibilityLabels[d.visibility]?.label || 'Public'}
                </span>
                <span className="text-xs text-slate-600">
                  by <span className="text-slate-400">{d.authorName || d.authorId?.substring(0, 8) + '...'}</span>
                </span>
                <span className="text-xs text-slate-600">{formatTime(d.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
