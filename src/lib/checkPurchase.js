import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Check if a user has purchased a specific course.
 * Returns true if a purchase document exists for the given userId + courseId.
 */
export async function hasPurchased(userId, courseId) {
  if (!userId || !courseId) return false;
  try {
    const snap = await getDocs(query(
      collection(db, 'purchases'),
      where('userId', '==', userId),
      where('courseId', '==', courseId),
    ));
    return !snap.empty;
  } catch {
    return false;
  }
}
