'use client'

import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { use, useEffect, useState } from 'react';
import VideoCard from '../../../components/VideoCard';
import ConfirmDialog from '../../../components/ConfirmDialog';
import Link from 'next/link';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../../store/slices/authSlice';
import { deleteVideo, toggleVideoVisibility, sendConnectionRequest, removeConnection, acceptConnectionRequest, rejectConnectionRequest } from '../../actions';
import { toast } from 'sonner';
import BadgeGrid from '../../../components/BadgeGrid';
import { computeBadgesForUser } from '../../../lib/computeBadges';

function VideoCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="aspect-video animate-pulse-soft bg-white/[0.04]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="h-3 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-3 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
      <div className="border-t border-white/[0.04] px-4 py-3">
        <div className="h-3 w-20 rounded-lg animate-pulse-soft bg-white/[0.04]" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-8">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl animate-pulse-soft bg-white/[0.06]" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded-lg animate-pulse-soft bg-white/[0.06]" />
            <div className="h-3 w-48 rounded-lg animate-pulse-soft bg-white/[0.04]" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 w-20 rounded animate-pulse-soft bg-white/[0.04]" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const UserProfilePage = ({ params: paramsPromise }) => {
  const params = use(paramsPromise);
  const [videos, setVideos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'connected' | 'pending-sent' | 'pending-received' | null
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [badges, setBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const currentUser = useAppSelector(selectUser);
  const isOwner = currentUser?.uid === params.userId;

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [videosSnap, profileSnap] = await Promise.all([
          getDocs(query(collection(db, 'videos'), where("authorId", "==", params.userId))),
          getDoc(doc(db, 'users', params.userId)),
        ]);

        if (cancelled) return;

        const authorName = profileSnap.exists() ? profileSnap.data().displayName || null : null;
        setVideos(videosSnap.docs.map(d => ({ id: d.id, ...d.data(), authorName })));

        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        // Check connection status
        if (currentUser && currentUser.uid !== params.userId) {
          const isConnected = profileSnap.exists() && profileSnap.data().connections?.includes(currentUser.uid);
          if (isConnected) {
            setConnectionStatus('connected');
          } else {
            // Check for pending requests
            const sentSnap = await getDocs(query(
              collection(db, 'connectionRequests'),
              where('from', '==', currentUser.uid),
              where('to', '==', params.userId),
            ));
            if (!sentSnap.empty) {
              setConnectionStatus('pending-sent');
            } else {
              const receivedSnap = await getDocs(query(
                collection(db, 'connectionRequests'),
                where('from', '==', params.userId),
                where('to', '==', currentUser.uid),
              ));
              if (!receivedSnap.empty) {
                setConnectionStatus('pending-received');
                setPendingRequestId(receivedSnap.docs[0].id);
              }
            }
          }
        }
        // Compute badges
        computeBadgesForUser(params.userId).then(({ earned }) => {
          if (!cancelled) { setBadges(earned); setBadgesLoading(false); }
        }).catch(() => { if (!cancelled) setBadgesLoading(false); });
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      if (!cancelled) setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [params.userId, currentUser]);

  const handleConnect = async () => {
    if (!currentUser) return;
    setConnectionLoading(true);
    const result = await sendConnectionRequest(currentUser.uid, params.userId);
    if (result.success) {
      if (result.status === 'connected') {
        setConnectionStatus('connected');
        setProfile(prev => ({ ...prev, connections: [...(prev?.connections || []), currentUser.uid] }));
        toast.success('Connected!');
      } else {
        setConnectionStatus('pending-sent');
        toast.success('Connection request sent');
      }
    } else {
      toast.error(result.error);
    }
    setConnectionLoading(false);
  };

  const handleAcceptConnection = async () => {
    if (!currentUser || !pendingRequestId) return;
    setConnectionLoading(true);
    const result = await acceptConnectionRequest(currentUser.uid, pendingRequestId);
    if (result.success) {
      setConnectionStatus('connected');
      setProfile(prev => ({ ...prev, connections: [...(prev?.connections || []), currentUser.uid] }));
      setPendingRequestId(null);
      toast.success('Connection accepted!');
    } else {
      toast.error(result.error);
    }
    setConnectionLoading(false);
  };

  const handleRejectConnection = async () => {
    if (!currentUser || !pendingRequestId) return;
    setConnectionLoading(true);
    const result = await rejectConnectionRequest(currentUser.uid, pendingRequestId);
    if (result.success) {
      setConnectionStatus(null);
      setPendingRequestId(null);
      toast.success('Request declined');
    } else {
      toast.error(result.error);
    }
    setConnectionLoading(false);
  };

  const handleDisconnect = async () => {
    if (!currentUser) return;
    setConnectionLoading(true);
    const result = await removeConnection(currentUser.uid, params.userId);
    if (result.success) {
      setConnectionStatus(null);
      setProfile(prev => ({
        ...prev,
        connections: (prev?.connections || []).filter(id => id !== currentUser.uid),
      }));
      toast.success('Connection removed');
    } else {
      toast.error(result.error);
    }
    setConnectionLoading(false);
  };

  const handleDelete = async (videoId) => {
    setConfirmDelete(videoId);
  };

  const confirmDeleteVideo = async () => {
    const videoId = confirmDelete;
    setConfirmDelete(null);
    setActionLoading(videoId);
    const result = await deleteVideo(videoId, currentUser.uid);
    if (result.success) {
      setVideos(prev => prev.filter(v => v.id !== videoId));
      toast.success('Video deleted');
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  const handleToggleVisibility = async (videoId) => {
    setActionLoading(videoId);
    const result = await toggleVideoVisibility(videoId, currentUser.uid);
    if (result.success) {
      setVideos(prev =>
        prev.map(v => v.id === videoId ? { ...v, hidden: result.hidden } : v)
      );
      toast.success(result.hidden ? 'Video hidden' : 'Video visible');
    } else {
      toast.error(result.error);
    }
    setActionLoading(null);
  };

  const visibleVideos = isOwner ? videos : videos.filter(v => !v.hidden);

  if (loading) {
    return <ProfileSkeleton />;
  }

  const displayName = profile?.displayName || params.userId.substring(0, 8) + '...';
  const connectionCount = profile?.connections?.length || 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Profile Header */}
      <div className="flex flex-col gap-6 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20">
            <span className="text-xl font-bold text-indigo-400">
              {(profile?.displayName || params.userId).substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-white">{displayName}</h1>
              {isOwner && (
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-[0.6875rem] font-medium text-indigo-400">
                  You
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {profile?.bio || (isOwner ? 'No bio yet — add one in Settings' : 'No bio')}
            </p>
            {profile?.joinedAt && (
              <p className="mt-1 text-xs text-slate-600">
                Joined {formatDate(profile.joinedAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <>
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.06] hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Edit Profile
              </Link>
              <Link
                href="/upload"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Upload Video
              </Link>
            </>
          ) : currentUser ? (
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <button
                  onClick={handleDisconnect}
                  disabled={connectionLoading}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 disabled:opacity-50"
                >
                  {connectionLoading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-6.071a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 006.364 6.364l1.757-1.757" />
                      </svg>
                      Connected
                    </>
                  )}
                </button>
              ) : connectionStatus === 'pending-sent' ? (
                <button
                  disabled
                  className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-2.5 text-sm font-medium text-yellow-400 cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending
                </button>
              ) : connectionStatus === 'pending-received' ? (
                <>
                  <button
                    onClick={handleAcceptConnection}
                    disabled={connectionLoading}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleRejectConnection}
                    disabled={connectionLoading}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={connectionLoading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {connectionLoading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                      </svg>
                      Connect
                    </>
                  )}
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center gap-6">
        <div>
          <span className="text-base font-bold text-white">{visibleVideos.length}</span>
          <span className="ml-1.5 text-sm text-slate-500">video{visibleVideos.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="h-4 w-px bg-white/[0.06]" />
        <div>
          <span className="text-base font-bold text-white">{connectionCount}</span>
          <span className="ml-1.5 text-sm text-slate-500">connection{connectionCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-white mb-3">Badges</h2>
        <BadgeGrid earned={badges} loading={badgesLoading} />
      </div>

      {/* Contact Info (if public and available) */}
      {profile && (profile.contactEmail || profile.website) && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {profile.contactEmail && (
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {profile.contactEmail}
            </span>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-indigo-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-6.071a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 006.364 6.364l1.757-1.757" />
              </svg>
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}

      {/* Videos Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {isOwner ? 'My Videos' : 'Videos'}
          </h2>
          {isOwner && videos.some(v => v.hidden) && (
            <span className="text-xs text-slate-500">{videos.filter(v => v.hidden).length} hidden</span>
          )}
        </div>

        {visibleVideos.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleVideos.map(video => (
              <div key={video.id} className="relative">
                <VideoCard video={video} />
                {isOwner && (
                  <div className={`absolute top-3 right-3 z-10 flex gap-1.5 ${video.hidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {video.hidden && (
                      <span className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 text-[0.6875rem] font-medium text-yellow-400">
                        Hidden
                      </span>
                    )}
                  </div>
                )}
                {isOwner && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleToggleVisibility(video.id)}
                      disabled={actionLoading === video.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[0.75rem] font-medium text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                    >
                      {actionLoading === video.id ? (
                        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {video.hidden ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            )}
                            {!video.hidden && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />}
                          </svg>
                          {video.hidden ? 'Show' : 'Hide'}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={actionLoading === video.id}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/10 bg-red-500/5 px-3 py-2 text-[0.75rem] font-medium text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 opacity-40">
              {[...Array(4)].map((_, i) => (
                <VideoCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white">No videos yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                {isOwner ? 'You haven\u2019t uploaded any videos yet.' : 'This user hasn\u2019t uploaded any videos.'}
              </p>
              <Link
                href={isOwner ? '/upload' : '/'}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white"
              >
                {isOwner ? (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Upload Your First Video
                  </>
                ) : 'Browse Videos'}
              </Link>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        visible={!!confirmDelete}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDeleteVideo}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default UserProfilePage;
