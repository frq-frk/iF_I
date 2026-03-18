'use client'

import { doc, getDoc, collection, getDocs, query, where, orderBy, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import { toast } from 'sonner';

const visibilityLabels = {
  anonymous: { label: 'Public', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', desc: 'Visible to everyone' },
  members: { label: 'Members', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', desc: 'Logged-in users only' },
  network: { label: 'Network', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', desc: "Author's connections only" },
};

function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ReplyItem({ reply, allReplies, depth, onReply, replyingTo, user }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const children = allReplies.filter(r => r.parentReplyId === reply.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = new FormData(e.target).get('body');
    await onReply(body, reply.id);
    setShowReplyForm(false);
    setSubmitting(false);
    e.target.reset();
  };

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-white/[0.06] pl-4' : ''}>
      <div className="py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/user/${reply.authorId}`}
            className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
          >
            {reply.authorName || reply.authorId?.substring(0, 8) + '...'}
          </Link>
          <span className="text-xs text-slate-600">{formatTime(reply.createdAt)}</span>
        </div>
        <p className="mt-1.5 text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
        {user && depth < 3 && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
          >
            Reply
          </button>
        )}

        {showReplyForm && (
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              name="body"
              type="text"
              placeholder="Write a reply..."
              required
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? '...' : 'Reply'}
            </button>
          </form>
        )}
      </div>

      {children.length > 0 && (
        <div>
          {children.map(child => (
            <ReplyItem
              key={child.id}
              reply={child}
              allReplies={allReplies}
              depth={depth + 1}
              onReply={onReply}
              replyingTo={replyingTo}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="h-7 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.06]" />
      <div className="mt-3 h-4 w-32 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-4 w-4/5 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-4 w-1/2 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
    </div>
  );
}

const DiscussionPage = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDoc(doc(db, 'discussions', params.id));
        if (!snap.exists()) { setLoading(false); return; }

        const data = { id: snap.id, ...snap.data() };

        // Check access
        if (data.visibility === 'members' && !user) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        if (data.visibility === 'network') {
          if (!user) {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
          // Check if current user is a connection of the author (or is the author)
          if (user.uid !== data.authorId) {
            const authorSnap = await getDoc(doc(db, 'users', data.authorId));
            const connections = authorSnap.exists() ? authorSnap.data().connections || [] : [];
            if (!connections.includes(user.uid)) {
              setAccessDenied(true);
              setLoading(false);
              return;
            }
          }
        }

        // Fetch author name if not on document
        if (!data.authorName && data.authorId) {
          const authorSnap = await getDoc(doc(db, 'users', data.authorId));
          if (authorSnap.exists()) data.authorName = authorSnap.data().displayName || null;
        }

        setDiscussion(data);

        // Fetch replies
        const repliesSnap = await getDocs(query(
          collection(db, 'replies'),
          where('discussionId', '==', params.id),
          orderBy('createdAt', 'asc'),
        ));

        const replyItems = repliesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Batch-fetch reply author names
        const authorIds = [...new Set(replyItems.map(r => r.authorId).filter(Boolean))];
        const nameMap = {};
        await Promise.all(authorIds.map(async (uid) => {
          try {
            const s = await getDoc(doc(db, 'users', uid));
            if (s.exists()) nameMap[uid] = s.data().displayName || null;
          } catch {}
        }));

        setReplies(replyItems.map(r => ({ ...r, authorName: nameMap[r.authorId] || r.authorName || null })));
      } catch (err) {
        console.error('Error fetching discussion:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, [params.id, user]);

  const handleReply = async (body, parentReplyId = null) => {
    if (!user) { toast.error('You must be logged in to reply.'); return; }

    try {
      const replyRef = await addDoc(collection(db, 'replies'), {
        discussionId: params.id,
        body,
        parentReplyId,
        authorId: user.uid,
        authorName: user.displayName || null,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'discussions', params.id), { replyCount: increment(1) });

      setReplies(prev => [...prev, {
        id: replyRef.id,
        discussionId: params.id,
        body,
        parentReplyId,
        authorId: user.uid,
        authorName: user.displayName || null,
        createdAt: new Date(),
      }]);

      setDiscussion(prev => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));
    } catch (err) {
      console.error('Error posting reply:', err);
      toast.error('Failed to post reply');
    }
  };

  const handleTopLevelReply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = new FormData(e.target).get('body');
    await handleReply(body);
    e.target.reset();
    setSubmitting(false);
  };

  if (loading) return <ThreadSkeleton />;

  if (accessDenied) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-500">
          {!user ? 'You must be logged in to view this discussion.' : "This discussion is only visible to the author's network."}
        </p>
        <Link href="/discussions" className="mt-6 rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white">
          Back to Discussions
        </Link>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
        <h2 className="text-lg font-semibold text-white">Discussion not found</h2>
        <Link href="/discussions" className="mt-4 rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white">
          Back to Discussions
        </Link>
      </div>
    );
  }

  const topLevelReplies = replies.filter(r => !r.parentReplyId);
  const vis = visibilityLabels[discussion.visibility] || visibilityLabels.anonymous;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 animate-fade-in">
      {/* Breadcrumb */}
      <Link href="/discussions" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        All Discussions
      </Link>

      {/* Thread header */}
      <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-medium ${vis.color}`}>
            {vis.label}
          </span>
          <span className="text-xs text-slate-600">{vis.desc}</span>
        </div>
        <h1 className="mt-4 text-xl font-bold tracking-tight text-white">{discussion.title}</h1>
        <div className="mt-2 flex items-center gap-3">
          <Link
            href={`/user/${discussion.authorId}`}
            className="text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            {discussion.authorName || discussion.authorId?.substring(0, 8) + '...'}
          </Link>
          <span className="text-xs text-slate-600">{formatTime(discussion.createdAt)}</span>
        </div>
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{discussion.body}</p>
        </div>
      </div>

      {/* Replies section */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>

        {topLevelReplies.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04] px-5">
            {topLevelReplies.map(reply => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                allReplies={replies}
                depth={0}
                onReply={handleReply}
                replyingTo={null}
                user={user}
              />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No replies yet. Be the first to respond.</p>
        )}

        {/* Top-level reply form */}
        {user ? (
          <form onSubmit={handleTopLevelReply} className="mt-6 flex gap-3">
            <textarea
              name="body"
              placeholder="Write a reply..."
              required
              rows="3"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={submitting}
              className="self-end rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Reply'}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
            <p className="text-sm text-slate-500">
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Log in</Link> to join the conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionPage;
