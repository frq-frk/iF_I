import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId, userId } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature using HMAC SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Check if already purchased (idempotency)
    const existingPurchase = await adminDb
      .collection('purchases')
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();

    if (!existingPurchase.empty) {
      return NextResponse.json({ success: true, message: 'Already purchased' });
    }

    // Create purchase record
    await adminDb.collection('purchases').add({
      userId,
      courseId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: null, // Will be enriched if needed
      purchasedAt: FieldValue.serverTimestamp(),
    });

    // Optionally fetch amount from course
    const courseSnap = await adminDb.collection('courses').doc(courseId).get();
    if (courseSnap.exists) {
      const purchaseQuery = await adminDb
        .collection('purchases')
        .where('razorpayPaymentId', '==', razorpay_payment_id)
        .limit(1)
        .get();
      if (!purchaseQuery.empty) {
        await purchaseQuery.docs[0].ref.update({ amount: courseSnap.data().price || 0 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
