'use client'

import { use, useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import CourseSidebar from '../../../../../components/courses/CourseSidebar';
import LessonPlayer from '../../../../../components/courses/LessonPlayer';
import LessonNavigation from '../../../../../components/courses/LessonNavigation';
import Link from 'next/link';

function LessonSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          <div className="aspect-video w-full rounded-2xl animate-pulse-soft bg-white/[0.04]" />
          <div className="h-6 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.06]" />
          <div className="h-4 w-1/2 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl animate-pulse-soft bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LessonPage({ params }) {
  const { courseId, lessonId } = use(params);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch course
        const courseSnap = await getDoc(doc(db, 'courses', courseId));
        if (courseSnap.exists()) {
          setCourse({ id: courseSnap.id, ...courseSnap.data() });
        }

        // Fetch all lessons for this course
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('courseId', '==', courseId),
          orderBy('order', 'asc')
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        const allLessons = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLessons(allLessons);

        // Find current lesson
        const current = allLessons.find(l => l.id === lessonId);
        setLesson(current || null);
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [courseId, lessonId]);

  if (loading) return <LessonSkeleton />;

  if (!lesson) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">Lesson not found</h2>
          <p className="mt-1 text-sm text-slate-500">This lesson may have been removed</p>
          <Link href={`/course/${courseId}`} className="mt-6 inline-block rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/learn" className="transition-colors hover:text-slate-300">Learn</Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <Link href={`/course/${courseId}`} className="transition-colors hover:text-slate-300 truncate max-w-[150px]">
          {course?.title || 'Course'}
        </Link>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-slate-300 truncate">{lesson.title}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <LessonPlayer lesson={lesson} />

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{lesson.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                {lesson.type === 'video' ? (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                )}
                {lesson.type === 'video' ? 'Video Lesson' : 'Article'}
              </span>
              {lesson.duration && <span>{lesson.duration}</span>}
              <span>Lesson {currentIndex + 1} of {lessons.length}</span>
            </div>
          </div>

          <LessonNavigation
            prevLesson={prevLesson}
            nextLesson={nextLesson}
            courseId={courseId}
          />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <CourseSidebar
            lessons={lessons}
            courseId={courseId}
            currentLessonId={lessonId}
          />
        </div>
      </div>

      {/* Mobile Lesson List */}
      <div className="mt-8 lg:hidden">
        <CourseSidebar
          lessons={lessons}
          courseId={courseId}
          currentLessonId={lessonId}
        />
      </div>
    </div>
  );
}
