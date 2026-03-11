'use server'

import { auth, db, storage } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function signup(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (password !== confirmPassword) {
    return { message: 'Passwords do not match' };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { message: 'User created successfully', user: { uid: userCredential.user.uid, email: userCredential.user.email } };
  } catch (error) {
    return { message: error.message };
  }
}

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { message: 'Login successful', user: { uid: userCredential.user.uid, email: userCredential.user.email } };
  } catch (error) {
    return { message: error.message };
  }
}

export async function uploadVideo(prevState, formData) {
  const title = formData.get('title');
  const description = formData.get('description');
  const videoFile = formData.get('video');
  const user = auth.currentUser;

  if (!user) {
    return { message: 'You must be logged in to upload a video.' };
  }

  try {
    const fileName = `${user.uid}-${Date.now()}`;
    const storageRef = ref(storage, `videos/${fileName}`);
    const uploadTask = await uploadBytes(storageRef, videoFile);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    await addDoc(collection(db, "videos"), {
      title,
      description,
      downloadURL,
      authorId: user.uid,
      createdAt: serverTimestamp()
    });

    return { message: 'Video uploaded successfully!' };
  } catch (error) {
    return { message: 'Failed to upload video.' };
  }
}
