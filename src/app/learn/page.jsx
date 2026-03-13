import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CourseCard from '../../components/courses/CourseCard';

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div className="aspect-video animate-pulse-soft bg-white/[0.04]" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded-lg animate-pulse-soft bg-white/[0.06]" />
        <div className="h-3 w-full rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="h-3 w-2/3 rounded-lg animate-pulse-soft bg-white/[0.04]" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 rounded-full animate-pulse-soft bg-white/[0.04]" />
          <div className="h-5 w-20 rounded-full animate-pulse-soft bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

async function getCourses() {
  try {
    const coursesCollection = collection(db, 'courses');
    const q = query(coursesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export default async function LearnPage() {
  const courses = await getCourses();

  // Group by level
  const beginner = courses.filter(c => c.level === 'beginner');
  const intermediate = courses.filter(c => c.level === 'intermediate');
  const advanced = courses.filter(c => c.level === 'advanced');

  const isEmpty = courses.length === 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/[0.07] via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center sm:py-24">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
            <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Learn
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"> Filmmaking</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Structured courses to level up your filmmaking and technical skills. From beginner fundamentals to advanced techniques.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {isEmpty ? (
          <div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <svg className="h-7 w-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">No courses yet</h3>
              <p className="mt-1 text-sm text-slate-500">Courses are coming soon — stay tuned!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* All Courses (if no level grouping is significant) or grouped */}
            {beginner.length > 0 && (
              <section>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <h2 className="text-xl font-bold tracking-tight text-white">Beginner</h2>
                  <span className="text-sm text-slate-500">{beginner.length}</span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {beginner.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {intermediate.length > 0 && (
              <section>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <h2 className="text-xl font-bold tracking-tight text-white">Intermediate</h2>
                  <span className="text-sm text-slate-500">{intermediate.length}</span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {intermediate.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}

            {advanced.length > 0 && (
              <section>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                  <h2 className="text-xl font-bold tracking-tight text-white">Advanced</h2>
                  <span className="text-sm text-slate-500">{advanced.length}</span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {advanced.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
