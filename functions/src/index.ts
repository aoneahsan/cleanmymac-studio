import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Submit Pro Plan Request
export const submitProRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in to request Pro plan'
    );
  }
  
  const { email, phone, whatsapp, country, preferredContact, message } = data;
  
  // Validate required fields
  if (!email || !preferredContact) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email and preferred contact method are required'
    );
  }
  
  try {
    // Create pro request
    const requestRef = await admin.firestore()
      .collection('cmp_pro_requests')
      .add({
        userId: context.auth.uid,
        email,
        phone: phone || null,
        whatsapp: whatsapp || null,
        country: country || null,
        preferredContact,
        message: message || null,
        status: 'pending',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    
    return {
      success: true,
      requestId: requestRef.id,
      message: 'Pro plan request submitted successfully',
    };
    
  } catch (error) {
    console.error('Error submitting pro request:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to submit pro request'
    );
  }
});

// Admin function to manually upgrade user's plan
export const upgradeUserPlan = functions.https.onCall(async (data, context) => {
  // Verify admin authentication
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can upgrade user plans'
    );
  }
  
  const { 
    userIdentifier, // email or uid
    plan,          // 'pro' | 'trial'
    duration,      // 'monthly' | 'annual' | 'lifetime'
    notes 
  } = data;
  
  try {
    // Find user by email or uid
    let userRecord;
    if (userIdentifier.includes('@')) {
      userRecord = await admin.auth().getUserByEmail(userIdentifier);
    } else {
      userRecord = await admin.auth().getUser(userIdentifier);
    }
    
    // Calculate expiration
    let expiresAt;
    const now = new Date();
    switch (duration) {
      case 'monthly':
        expiresAt = admin.firestore.Timestamp.fromDate(
          new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        );
        break;
      case 'annual':
        expiresAt = admin.firestore.Timestamp.fromDate(
          new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        );
        break;
      case 'lifetime':
        expiresAt = null; // No expiration
        break;
    }
    
    // Update user document
    await admin.firestore()
      .collection('cmp_users')
      .doc(userRecord.uid)
      .update({
        plan: {
          type: plan,
          expiresAt,
          activatedAt: admin.firestore.FieldValue.serverTimestamp(),
          activatedBy: context.auth.uid,
          method: 'manual',
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    
    // Log the upgrade
    await admin.firestore()
      .collection('cmp_upgrade_logs')
      .add({
        userId: userRecord.uid,
        userEmail: userRecord.email,
        plan,
        duration,
        activatedBy: context.auth.uid,
        notes,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    
    // Update pro request status if exists
    const requestQuery = await admin.firestore()
      .collection('cmp_pro_requests')
      .where('email', '==', userRecord.email)
      .where('status', '==', 'pending')
      .get();
    
    if (!requestQuery.empty) {
      await requestQuery.docs[0].ref.update({
        status: 'converted',
        convertedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    return {
      success: true,
      message: `Successfully upgraded ${userRecord.email} to ${plan} plan`,
      userId: userRecord.uid,
    };
    
  } catch (error) {
    console.error('Error upgrading user plan:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to upgrade user plan'
    );
  }
});

// Track usage for free plan limitations
export const trackUsage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to track usage'
    );
  }
  
  const { action, amount } = data;
  const userId = context.auth.uid;
  
  try {
    const userRef = admin.firestore().collection('cmp_users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User not found'
      );
    }
    
    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if user is on free plan
    if (userData?.plan?.type === 'pro') {
      return { allowed: true, limit: null };
    }
    
    // Track daily scans
    if (action === 'scan') {
      const scansToday = userData?.usage?.scansToday || 0;
      const lastScanDate = userData?.usage?.lastScanDate?.toDate().toISOString().split('T')[0];
      
      // Reset daily counter if new day
      if (lastScanDate !== today) {
        await userRef.update({
          'usage.scansToday': 1,
          'usage.lastScanDate': admin.firestore.FieldValue.serverTimestamp(),
        });
        return { allowed: true, limit: 1, used: 1 };
      }
      
      // Check daily limit (1 scan for free users)
      if (scansToday >= 1) {
        return { allowed: false, limit: 1, used: scansToday };
      }
      
      // Increment scan count
      await userRef.update({
        'usage.scansToday': admin.firestore.FieldValue.increment(1),
        'usage.lastScanDate': admin.firestore.FieldValue.serverTimestamp(),
      });
      
      return { allowed: true, limit: 1, used: scansToday + 1 };
    }
    
    // Track cleanup size
    if (action === 'cleanup' && amount) {
      const totalCleaned = userData?.usage?.totalCleaned || 0;
      const monthlyLimit = 500 * 1024 * 1024; // 500MB in bytes
      
      if (totalCleaned + amount > monthlyLimit) {
        return { 
          allowed: false, 
          limit: monthlyLimit, 
          used: totalCleaned,
          remaining: Math.max(0, monthlyLimit - totalCleaned)
        };
      }
      
      await userRef.update({
        'usage.totalCleaned': admin.firestore.FieldValue.increment(amount),
      });
      
      return { 
        allowed: true, 
        limit: monthlyLimit, 
        used: totalCleaned + amount,
        remaining: monthlyLimit - (totalCleaned + amount)
      };
    }
    
    return { allowed: true };
    
  } catch (error) {
    console.error('Error tracking usage:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to track usage'
    );
  }
});