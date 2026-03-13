'use client'

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAppSelector } from '../../store/hooks';
import { selectUser, selectAuthLoading } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const SettingsPage = () => {
  const user = useAppSelector(selectUser);
  const authLoading = useAppSelector(selectAuthLoading);
  const router = useRouter();

  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    contactEmail: '',
    phone: '',
    website: '',
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    privateProfile: false,
    autoplayVideos: true,
    theme: 'dark',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [profileSnap, settingsSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'settings', user.uid)),
        ]);

        if (cancelled) return;

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setProfile({
            displayName: data.displayName || '',
            bio: data.bio || '',
            contactEmail: data.contactEmail || '',
            phone: data.phone || '',
            website: data.website || '',
          });
        }

        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
      if (!cancelled) setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);


    try {
      await Promise.all([
        setDoc(doc(db, 'users', user.uid), {
          displayName: profile.displayName,
          bio: profile.bio,
          contactEmail: profile.contactEmail,
          phone: profile.phone,
          website: profile.website,
        }, { merge: true }),
        setDoc(doc(db, 'settings', user.uid), settings, { merge: true }),
      ]);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="h-7 w-32 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="mt-2 h-4 w-48 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="mt-8 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 rounded animate-pulse-soft bg-white/[0.06]" />
              <div className="h-11 rounded-xl animate-pulse-soft bg-white/[0.04]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const inputClass = "mt-2 block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-indigo-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50";
  const labelClass = "block text-xs font-medium uppercase tracking-wider text-slate-500";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your profile and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-8">
        {/* Profile Section */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">Profile Information</h2>
          <p className="mt-1 text-sm text-slate-500">This information will be displayed on your profile.</p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="displayName" className={labelClass}>Display Name</label>
              <input
                id="displayName"
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile(p => ({ ...p, displayName: e.target.value }))}
                placeholder="Your display name"
                className={inputClass}
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="bio" className={labelClass}>Bio</label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                placeholder="Tell others about yourself..."
                className={inputClass}
                rows="3"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">Contact Details</h2>
          <p className="mt-1 text-sm text-slate-500">How people can reach you.</p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="contactEmail" className={labelClass}>Contact Email</label>
              <input
                id="contactEmail"
                type="email"
                value={profile.contactEmail}
                onChange={(e) => setProfile(p => ({ ...p, contactEmail: e.target.value }))}
                placeholder="public@example.com"
                className={inputClass}
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone</label>
              <input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
                className={inputClass}
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="website" className={labelClass}>Website</label>
              <input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
                className={inputClass}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
          <h2 className="text-base font-semibold text-white">Preferences</h2>
          <p className="mt-1 text-sm text-slate-500">Customize your experience.</p>

          <div className="mt-6 space-y-4">
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your account activity' },
              { key: 'privateProfile', label: 'Private Profile', desc: 'Only followers can see your videos and profile details' },
              { key: 'autoplayVideos', label: 'Autoplay Videos', desc: 'Automatically play videos when visiting a video page' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-3.5">
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                    settings[key] ? 'bg-indigo-600' : 'bg-white/[0.1]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                      settings[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
