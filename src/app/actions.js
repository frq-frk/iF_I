'use server'

import { db, storage } from '../lib/firebase';
import { ref, deleteObject } from "firebase/storage";
import { doc, deleteDoc, updateDoc, getDoc, addDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from "firebase/firestore";

export async function deleteVideo(videoId, userId) {
  if (!userId) {
    return { error: 'You must be logged in.' };
  }

  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      return { error: 'Video not found.' };
    }

    if (videoSnap.data().authorId !== userId) {
      return { error: 'You can only delete your own videos.' };
    }

    // Delete from Storage
    try {
      const videoUrl = videoSnap.data().downloadURL;
      const storageRef = ref(storage, videoUrl);
      await deleteObject(storageRef);
    } catch {
      // Storage file may already be deleted — continue with Firestore cleanup
    }

    await deleteDoc(videoRef);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete video.' };
  }
}

export async function toggleVideoVisibility(videoId, userId) {
  if (!userId) {
    return { error: 'You must be logged in.' };
  }

  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnap = await getDoc(videoRef);

    if (!videoSnap.exists()) {
      return { error: 'Video not found.' };
    }

    if (videoSnap.data().authorId !== userId) {
      return { error: 'You can only modify your own videos.' };
    }

    const currentlyHidden = videoSnap.data().hidden || false;
    await updateDoc(videoRef, { hidden: !currentlyHidden });
    return { success: true, hidden: !currentlyHidden };
  } catch (error) {
    return { error: 'Failed to update video visibility.' };
  }
}

export async function sendConnectionRequest(currentUserId, targetUserId) {
  if (!currentUserId) return { error: 'You must be logged in.' };
  if (currentUserId === targetUserId) return { error: 'You cannot connect with yourself.' };

  try {
    // Check if already connected
    const userSnap = await getDoc(doc(db, 'users', currentUserId));
    if (userSnap.exists() && userSnap.data().connections?.includes(targetUserId)) {
      return { error: 'Already connected.' };
    }

    // Check for existing pending request in either direction
    const existing = await getDocs(query(
      collection(db, 'connectionRequests'),
      where('from', '==', currentUserId),
      where('to', '==', targetUserId),
    ));
    if (!existing.empty) return { error: 'Request already sent.' };

    const reverse = await getDocs(query(
      collection(db, 'connectionRequests'),
      where('from', '==', targetUserId),
      where('to', '==', currentUserId),
    ));
    if (!reverse.empty) {
      // They already sent us a request — accept it automatically
      const reqDoc = reverse.docs[0];
      await Promise.all([
        updateDoc(doc(db, 'users', currentUserId), { connections: arrayUnion(targetUserId) }),
        updateDoc(doc(db, 'users', targetUserId), { connections: arrayUnion(currentUserId) }),
        deleteDoc(reqDoc.ref),
      ]);
      return { success: true, status: 'connected' };
    }

    await addDoc(collection(db, 'connectionRequests'), {
      from: currentUserId,
      to: targetUserId,
      createdAt: new Date(),
    });

    return { success: true, status: 'pending' };
  } catch (error) {
    return { error: 'Failed to send connection request.' };
  }
}

export async function acceptConnectionRequest(currentUserId, requestId) {
  if (!currentUserId) return { error: 'You must be logged in.' };

  try {
    const reqRef = doc(db, 'connectionRequests', requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) return { error: 'Request not found.' };

    const { from, to } = reqSnap.data();
    if (to !== currentUserId) return { error: 'Not authorized.' };

    await Promise.all([
      updateDoc(doc(db, 'users', from), { connections: arrayUnion(to) }),
      updateDoc(doc(db, 'users', to), { connections: arrayUnion(from) }),
      deleteDoc(reqRef),
    ]);

    return { success: true };
  } catch (error) {
    return { error: 'Failed to accept request.' };
  }
}

export async function rejectConnectionRequest(currentUserId, requestId) {
  if (!currentUserId) return { error: 'You must be logged in.' };

  try {
    const reqRef = doc(db, 'connectionRequests', requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) return { error: 'Request not found.' };

    if (reqSnap.data().to !== currentUserId) return { error: 'Not authorized.' };

    await deleteDoc(reqRef);
    return { success: true };
  } catch (error) {
    return { error: 'Failed to reject request.' };
  }
}

export async function removeConnection(currentUserId, targetUserId) {
  if (!currentUserId) return { error: 'You must be logged in.' };

  try {
    await Promise.all([
      updateDoc(doc(db, 'users', currentUserId), { connections: arrayRemove(targetUserId) }),
      updateDoc(doc(db, 'users', targetUserId), { connections: arrayRemove(currentUserId) }),
    ]);

    return { success: true };
  } catch (error) {
    return { error: 'Failed to remove connection.' };
  }
}
