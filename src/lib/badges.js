/**
 * Badge definitions for the achievement system.
 * Each badge has an id, name, description, color theme, and a check function
 * that takes a stats object and returns true if the badge is earned.
 */

export const BADGES = [
  // ── Creator badges (emerald) ──
  {
    id: 'first-upload',
    name: 'First Upload',
    description: 'Upload your first video',
    color: 'emerald',
    icon: 'camera',
    check: (s) => s.videoCount >= 1,
  },
  {
    id: 'prolific-creator',
    name: 'Prolific Creator',
    description: 'Upload 5 videos',
    color: 'emerald',
    icon: 'film',
    check: (s) => s.videoCount >= 5,
  },
  {
    id: 'director',
    name: 'Director',
    description: 'Upload 15 videos',
    color: 'emerald',
    icon: 'clapperboard',
    check: (s) => s.videoCount >= 15,
  },

  // ── Social badges (indigo) ──
  {
    id: 'first-connection',
    name: 'First Connection',
    description: 'Make your first connection',
    color: 'indigo',
    icon: 'handshake',
    check: (s) => s.connectionCount >= 1,
  },
  {
    id: 'networker',
    name: 'Networker',
    description: 'Grow your network to 10 connections',
    color: 'indigo',
    icon: 'globe',
    check: (s) => s.connectionCount >= 10,
  },
  {
    id: 'influencer',
    name: 'Influencer',
    description: 'Reach 25 connections',
    color: 'indigo',
    icon: 'star',
    check: (s) => s.connectionCount >= 25,
  },

  // ── Learning badges (amber) ──
  {
    id: 'course-starter',
    name: 'Course Starter',
    description: 'Pass your first quiz or submission',
    color: 'amber',
    icon: 'seedling',
    check: (s) => s.passedLessonCount >= 1,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete an entire course',
    color: 'amber',
    icon: 'graduation',
    check: (s) => s.completedCourseCount >= 1,
  },
  {
    id: 'ace',
    name: 'Ace',
    description: 'Score 100% on any quiz',
    color: 'amber',
    icon: 'bolt',
    check: (s) => s.perfectScoreCount >= 1,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete 3 courses',
    color: 'amber',
    icon: 'crown',
    check: (s) => s.completedCourseCount >= 3,
  },

  // ── Competition badges (red) ──
  {
    id: 'competitor',
    name: 'Competitor',
    description: 'Submit to your first contest',
    color: 'red',
    icon: 'trophy',
    check: (s) => s.contestSubmissionCount >= 1,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Submit to 3 contests',
    color: 'red',
    icon: 'medal',
    check: (s) => s.contestSubmissionCount >= 3,
  },

  // ── Community badges (violet) ──
  {
    id: 'conversationalist',
    name: 'Conversationalist',
    description: 'Start 5 discussions',
    color: 'violet',
    icon: 'chat',
    check: (s) => s.discussionCount >= 5,
  },

  // ── Special badges (slate) ──
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Be a member for over 30 days',
    color: 'slate',
    icon: 'clock',
    check: (s) => s.accountAgeDays >= 30,
  },
];

export const BADGE_COLORS = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    text: 'text-indigo-400',
    glow: 'shadow-indigo-500/10',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/10',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    glow: 'shadow-red-500/10',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/10',
  },
  slate: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-400',
    glow: 'shadow-slate-500/10',
  },
};
