import { collection, query, where, getDocs, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { BADGES } from './badges';

/**
 * Compute which badges a user has earned by querying Firestore activity.
 * Returns { stats, earned: Badge[] }
 */
export async function computeBadgesForUser(userId) {
  const [
    videoCount,
    connectionCount,
    { passedLessonCount, perfectScoreCount, completedCourseCount },
    contestSubmissionCount,
    discussionCount,
    accountAgeDays,
  ] = await Promise.all([
    countVideos(userId),
    countConnections(userId),
    countLearningProgress(userId),
    countContestSubmissions(userId),
    countDiscussions(userId),
    getAccountAgeDays(userId),
  ]);

  const stats = {
    videoCount,
    connectionCount,
    passedLessonCount,
    perfectScoreCount,
    completedCourseCount,
    contestSubmissionCount,
    discussionCount,
    accountAgeDays,
  };

  const earned = BADGES.filter(badge => badge.check(stats));
  return { stats, earned };
}

async function countVideos(userId) {
  try {
    const snap = await getCountFromServer(query(
      collection(db, 'videos'),
      where('authorId', '==', userId),
    ));
    return snap.data().count;
  } catch { return 0; }
}

async function countConnections(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    return snap.exists() ? (snap.data().connections?.length || 0) : 0;
  } catch { return 0; }
}

async function countLearningProgress(userId) {
  try {
    const snap = await getDocs(query(
      collection(db, 'lessonProgress'),
      where('userId', '==', userId),
      where('status', '==', 'passed'),
    ));

    const passed = snap.docs.map(d => d.data());
    const passedLessonCount = passed.length;
    const perfectScoreCount = passed.filter(p => p.score === 100).length;

    // Compute completed courses:
    // Group passed lessons by courseId, then for each course check if all graded lessons are passed
    const passedByCourse = {};
    for (const p of passed) {
      if (!passedByCourse[p.courseId]) passedByCourse[p.courseId] = new Set();
      passedByCourse[p.courseId].add(p.lessonId);
    }

    let completedCourseCount = 0;
    for (const courseId of Object.keys(passedByCourse)) {
      const lessonsSnap = await getDocs(query(
        collection(db, 'lessons'),
        where('courseId', '==', courseId),
      ));
      const gradedLessons = lessonsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(l => l.type === 'mcq' || l.type === 'submission');

      if (gradedLessons.length > 0 && gradedLessons.every(l => passedByCourse[courseId].has(l.id))) {
        completedCourseCount++;
      }
    }

    return { passedLessonCount, perfectScoreCount, completedCourseCount };
  } catch {
    return { passedLessonCount: 0, perfectScoreCount: 0, completedCourseCount: 0 };
  }
}

async function countContestSubmissions(userId) {
  try {
    const snap = await getCountFromServer(query(
      collection(db, 'contestSubmissions'),
      where('userId', '==', userId),
    ));
    return snap.data().count;
  } catch { return 0; }
}

async function countDiscussions(userId) {
  try {
    const snap = await getCountFromServer(query(
      collection(db, 'discussions'),
      where('authorId', '==', userId),
    ));
    return snap.data().count;
  } catch { return 0; }
}

async function getAccountAgeDays(userId) {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return 0;
    const joined = snap.data().joinedAt;
    if (!joined) return 0;
    const joinedDate = joined.toDate ? joined.toDate() : new Date(joined);
    const diffMs = Date.now() - joinedDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch { return 0; }
}
