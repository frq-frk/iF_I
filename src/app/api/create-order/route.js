import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (singleton)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const adminDb = getFirestore();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const { courseId, userId } = await request.json();

    if (!courseId || !userId) {
      return NextResponse.json({ error: 'Missing courseId or userId' }, { status: 400 });
    }

    // Verify course exists and is paid
    const courseSnap = await adminDb.collection('courses').doc(courseId).get();
    if (!courseSnap.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const course = courseSnap.data();
    if (!course.price || course.price <= 0) {
      return NextResponse.json({ error: 'This is a free course' }, { status: 400 });
    }

    // Check if already purchased
    const existingPurchase = await adminDb
      .collection('purchases')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (!existingPurchase.empty) {
      return NextResponse.json({ error: 'Already purchased' }, { status: 400 });
    }

    // Create Razorpay order (amount in paise)
    const order = await razorpay.orders.create({
      amount: course.price * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { courseId, userId, courseTitle: course.title },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
