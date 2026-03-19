import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, setDoc, Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAKci5cD7B0i3LiPm8zvqhQmkSohkXKHH0',
  authDomain: 'if-i-bf7f2.firebaseapp.com',
  projectId: 'if-i-bf7f2',
  storageBucket: 'if-i-bf7f2.firebasestorage.app',
  messagingSenderId: '23839225855',
  appId: '1:23839225855:web:6ef9af4a95b79977e119ca',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COURSE_ID = 'paid-course-cinematography';

async function seedPaidCourse() {
  console.log('💰 Seeding paid course...\n');

  await setDoc(doc(db, 'courses', COURSE_ID), {
    title: 'Cinematic Mastery: Pro Techniques',
    description: 'A premium deep-dive into professional cinematography techniques used in Hollywood productions. Covers advanced camera movement, anamorphic lenses, production design, and visual storytelling at the highest level.',
    level: 'advanced',
    duration: '5h 30m',
    thumbnail: 'https://picsum.photos/seed/paid-cine/640/360',
    lessonsCount: 5,
    tags: ['cinematography', 'professional', 'hollywood', 'premium'],
    price: 499,
    createdAt: Timestamp.now(),
  }, { merge: true });
  console.log(`  ✓ courses/${COURSE_ID} — Cinematic Mastery: Pro Techniques (₹499)`);

  const lessons = [
    {
      docId: `${COURSE_ID}-lesson-1`,
      title: 'Introduction: The Cinematographer\'s Eye',
      type: 'video',
      contentURL: 'https://www.w3schools.com/html/mov_bbb.mp4',
      order: 1,
      duration: '20:00',
    },
    {
      docId: `${COURSE_ID}-lesson-2`,
      title: 'Advanced Camera Movement Techniques',
      type: 'article',
      contentURL: 'Mastering camera movement is essential for cinematic storytelling.\n\nKey techniques covered:\n\n• Steadicam & Gimbal — Achieving smooth, floating shots that follow characters through complex environments.\n\n• Dolly Zoom (Vertigo Effect) — Simultaneously zooming and dollying to create a disorienting perspective shift.\n\n• Crane & Jib Shots — Sweeping vertical movements that reveal scale and grandeur.\n\n• Whip Pan — Fast horizontal rotations for energetic transitions between subjects.\n\n• Dutch Angle — Tilting the camera to create unease or visual tension.',
      order: 2,
      duration: '12 min read',
    },
    {
      docId: `${COURSE_ID}-lesson-3`,
      title: 'Anamorphic Lenses & Cinematic Look',
      type: 'video',
      contentURL: 'https://www.w3schools.com/html/movie.mp4',
      order: 3,
      duration: '35:00',
    },
    {
      docId: `${COURSE_ID}-lesson-4`,
      title: 'Production Design & Visual Storytelling',
      type: 'video',
      contentURL: 'https://www.w3schools.com/html/mov_bbb.mp4',
      order: 4,
      duration: '28:00',
    },
    {
      docId: `${COURSE_ID}-lesson-5`,
      title: 'Cinematography Mastery Quiz',
      type: 'mcq',
      order: 5,
      questions: [
        {
          question: 'What is a dolly zoom (Vertigo effect)?',
          options: [
            'Zooming in while moving the camera forward',
            'Zooming in while dollying out (or vice versa)',
            'A fast handheld zoom',
            'A zoom combined with a tilt',
          ],
          correctIndex: 1,
        },
        {
          question: 'What distinguishes anamorphic lenses from spherical lenses?',
          options: [
            'Anamorphic lenses are always wider',
            'Anamorphic lenses compress the image horizontally, creating oval bokeh and lens flares',
            'Anamorphic lenses have no distortion',
            'Anamorphic lenses are only used for close-ups',
          ],
          correctIndex: 1,
        },
        {
          question: 'What does a Dutch angle convey?',
          options: [
            'A sense of calm and stability',
            'Unease, tension, or disorientation',
            'A romantic mood',
            'A comedic tone',
          ],
          correctIndex: 1,
        },
      ],
    },
  ];

  for (const { docId, ...data } of lessons) {
    await setDoc(doc(db, 'lessons', docId), { ...data, courseId: COURSE_ID }, { merge: true });
    console.log(`  ✓ lessons/${docId} — ${data.title} (${data.type})`);
  }

  console.log('\n✅ Paid course seeded!');
  console.log('  First 2 lessons are free preview, the rest require purchase.');
  process.exit(0);
}

seedPaidCourse().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
