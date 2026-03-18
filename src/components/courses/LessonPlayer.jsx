'use client'

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'sonner';
import Link from 'next/link';

// ── Video lesson ──
function VideoPlayer({ lesson }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black">
      <div className="aspect-video">
        <video
          src={lesson.contentURL}
          controls
          preload="metadata"
          controlsList="nodownload"
          disablePictureInPicture
          playsInline
          onContextMenu={(e) => e.preventDefault()}
          className="h-full w-full"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

// ── Article lesson ──
function ArticleViewer({ lesson }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        Article
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
        {lesson.contentURL}
      </div>
    </div>
  );
}

// ── MCQ Test ──
function McqTest({ lesson, courseId }) {
  const user = useAppSelector(selectUser);
  const questions = lesson.questions || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [previousResult, setPreviousResult] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchPrevious = async () => {
      const snap = await getDocs(query(
        collection(db, 'lessonProgress'),
        where('lessonId', '==', lesson.id),
        where('userId', '==', user.uid),
      ));
      if (!snap.empty) {
        const best = snap.docs.map(d => d.data()).sort((a, b) => (b.score || 0) - (a.score || 0))[0];
        setPreviousResult(best);
      }
    };
    fetchPrevious();
  }, [lesson.id, user]);

  const handleSelect = (qIndex, optIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('Log in to submit'); return; }
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore({ correct, total: questions.length, pct });
    setSubmitted(true);

    try {
      await addDoc(collection(db, 'lessonProgress'), {
        lessonId: lesson.id,
        courseId,
        userId: user.uid,
        status: pct >= 70 ? 'passed' : 'failed',
        score: pct,
        submittedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error saving MCQ result:', err);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-slate-500">No questions available for this test.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        Multiple Choice Test
        {previousResult && (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ${
            previousResult.status === 'passed'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            Best: {previousResult.score}%
          </span>
        )}
      </div>

      {/* Score banner */}
      {submitted && score && (
        <div className={`mb-6 rounded-xl p-4 border ${
          score.pct >= 70
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-red-500/10 border-red-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-lg font-bold ${score.pct >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                {score.pct}%
              </p>
              <p className="text-sm text-slate-400">
                {score.correct} of {score.total} correct
                {score.pct >= 70 ? ' — Passed!' : ' — 70% needed to pass'}
              </p>
            </div>
            {score.pct < 70 && (
              <button
                onClick={handleRetry}
                className="rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const userAnswer = answers[qIndex];

          return (
            <div key={qIndex}>
              <p className="text-sm font-medium text-white mb-3">
                <span className="text-slate-500 mr-2">{qIndex + 1}.</span>
                {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = userAnswer === optIndex;
                  const showCorrect = submitted && optIndex === q.correctIndex;
                  const showWrong = submitted && isSelected && optIndex !== q.correctIndex;

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelect(qIndex, optIndex)}
                      disabled={submitted}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        showCorrect
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : showWrong
                          ? 'border-red-500/30 bg-red-500/10 text-red-300'
                          : isSelected
                          ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                          : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/[0.12] hover:bg-white/[0.04]'
                      } disabled:cursor-default`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                        showCorrect
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                          : showWrong
                          ? 'border-red-500/40 bg-red-500/20 text-red-400'
                          : isSelected
                          ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-400'
                          : 'border-white/[0.08] bg-white/[0.03] text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-8 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
        >
          Submit Answers
        </button>
      )}
    </div>
  );
}

// ── Video Submission ──
function VideoSubmission({ lesson, courseId }) {
  const user = useAppSelector(selectUser);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const check = async () => {
      const snap = await getDocs(query(
        collection(db, 'lessonProgress'),
        where('lessonId', '==', lesson.id),
        where('userId', '==', user.uid),
      ));
      if (!snap.empty) {
        setExistingSubmission(snap.docs[0].data());
      }
      setLoading(false);
    };
    check();
  }, [lesson.id, user]);

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-slate-500">
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Log in</Link> to submit your video.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
        <div className="h-6 w-1/3 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="mt-4 h-24 rounded-xl animate-pulse-soft bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Video Submission
        {existingSubmission && (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-[0.6875rem] font-medium border ${
            existingSubmission.status === 'passed'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : existingSubmission.status === 'failed'
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
          }`}>
            {existingSubmission.status === 'passed' ? 'Approved' : existingSubmission.status === 'failed' ? 'Rejected' : 'Under Review'}
          </span>
        )}
      </div>

      {/* Prompt / assignment description */}
      {lesson.prompt && (
        <div className="mb-6 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-white mb-2">Assignment</p>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{lesson.prompt}</p>
        </div>
      )}

      {existingSubmission ? (
        <div className={`rounded-xl border p-4 ${
          existingSubmission.status === 'passed'
            ? 'border-emerald-500/20 bg-emerald-500/10'
            : existingSubmission.status === 'failed'
            ? 'border-red-500/20 bg-red-500/10'
            : 'border-yellow-500/20 bg-yellow-500/10'
        }`}>
          <p className={`text-sm font-medium ${
            existingSubmission.status === 'passed' ? 'text-emerald-400' :
            existingSubmission.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {existingSubmission.status === 'passed'
              ? 'Your submission has been approved!'
              : existingSubmission.status === 'failed'
              ? 'Your submission was not accepted. You can submit again.'
              : 'Your submission is under review. You\'ll be notified once it\'s evaluated.'}
          </p>
        </div>
      ) : null}

      {(!existingSubmission || existingSubmission.status === 'failed') && (
        <Link
          href="/upload"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Your Submission
        </Link>
      )}
    </div>
  );
}

// ── Completion / Congratulations Note ──
function CompletionNote({ lesson, courseId }) {
  const user = useAppSelector(selectUser);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const check = async () => {
      // Check if ALL submission/mcq lessons in this course are passed
      const progressSnap = await getDocs(query(
        collection(db, 'lessonProgress'),
        where('courseId', '==', courseId),
        where('userId', '==', user.uid),
        where('status', '==', 'passed'),
      ));
      const passedLessonIds = new Set(progressSnap.docs.map(d => d.data().lessonId));

      // Get all graded lessons for this course
      const lessonsSnap = await getDocs(query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId),
      ));
      const gradedLessons = lessonsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(l => l.type === 'mcq' || l.type === 'submission');

      const allPassed = gradedLessons.length > 0 && gradedLessons.every(l => passedLessonIds.has(l.id));
      setUnlocked(allPassed);
      setLoading(false);
    };
    check();
  }, [courseId, user, lesson.id]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
        <div className="h-20 w-20 mx-auto rounded-full animate-pulse-soft bg-white/[0.04]" />
        <div className="mt-4 h-6 w-1/3 mx-auto rounded-lg animate-pulse-soft bg-white/[0.06]" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.06]">
          <svg className="h-10 w-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h3 className="mt-6 text-lg font-semibold text-white">Locked</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
          Complete and pass all quizzes and submissions in this course to unlock the completion certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-white/[0.02] to-white/[0.02] p-8 sm:p-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <svg className="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>
      <h3 className="mt-6 text-2xl font-bold text-white">Congratulations!</h3>
      <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        {lesson.message || 'You have successfully completed all requirements for this course. Great work!'}
      </p>
    </div>
  );
}

// ── Main export ──
const LessonPlayer = ({ lesson, courseId }) => {
  if (lesson.type === 'video') return <VideoPlayer lesson={lesson} />;
  if (lesson.type === 'mcq') return <McqTest lesson={lesson} courseId={courseId} />;
  if (lesson.type === 'submission') return <VideoSubmission lesson={lesson} courseId={courseId} />;
  if (lesson.type === 'completion') return <CompletionNote lesson={lesson} courseId={courseId} />;
  return <ArticleViewer lesson={lesson} />;
};

export default LessonPlayer;
