'use client'

import { use, useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import CourseHero from '../../../components/courses/CourseHero';
import CourseLessonList from '../../../components/courses/CourseLessonList';
import Link from 'next/link';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
      <div className="aspect-[21/9] w-full rounded-2xl animate-pulse-soft bg-white/[0.04]" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-5 w-1/3 rounded-lg animate-pulse-soft bg-white/[0.06]" />
          <div className="h-4 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
          <div className="h-4 w-4/5 rounded-lg animate-pulse-soft bg-white/[0.04]" />
          <div className="h-4 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse-soft bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage({ params }) {
  const { courseId } = use(params);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const courseSnap = await getDoc(doc(db, 'courses', courseId));
        if (!courseSnap.exists()) {
          setCourse(null);
          setLoading(false);
          return;
        }
        setCourse({ id: courseSnap.id, ...courseSnap.data() });

        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('courseId', '==', courseId),
          orderBy('order', 'asc')
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        setLessons(lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId]);

  if (loading) return <DetailSkeleton />;

  if (!course) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Course not found</h2>
          <p className="mt-1 text-sm text-slate-500">This course may have been removed</p>
          <Link href="/learn" className="mt-6 inline-block rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const firstLesson = lessons[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 animate-fade-in">
      <CourseHero course={course} />

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left — Description */}
        <div className="lg:col-span-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">About this course</h2>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-slate-300">
            {course.description}
          </p>

          {course.tags && course.tags.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">Topics</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {course.tags.map(tag => (
                  <span key={tag} className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {firstLesson && (
            <Link
              href={`/course/${course.id}/lesson/${firstLesson.id}`}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Start Course
            </Link>
          )}
        </div>

        {/* Right — Lesson List */}
        <div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Curriculum
                </h3>
                <span className="text-xs text-slate-500">{lessons.length} lessons</span>
              </div>
            </div>
            <div className="p-2">
              <CourseLessonList lessons={lessons} courseId={course.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
