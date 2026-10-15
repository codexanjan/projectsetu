/**
 * ProjectSetu — Administrator Bootstrap Script
 * Initializes or elevates the initial platform administrator with custom claims.
 * Run in trusted server environment: ts-node scripts/bootstrap-admin.ts <email>
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const adminEmail = process.argv[2] || 'admin@mospi.gov.in';

async function bootstrap() {
  console.log(`Bootstrapping ProjectSetu platform administrator for: ${adminEmail}`);

  // In local development/emulator mode, FIREBASE_AUTH_EMULATOR_HOST can be used
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log(`Using Auth Emulator at ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  }

  try {
    const adminApp = initializeApp();
    const auth = getAuth(adminApp);
    const db = getFirestore(adminApp);

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log(`Found existing user: ${userRecord.uid}`);
    } catch {
      userRecord = await auth.createUser({
        email: adminEmail,
        password: 'SetuSuperAdmin2026!',
        displayName: 'ProjectSetu Master Admin',
        emailVerified: true
      });
      console.log(`Created new admin user: ${userRecord.uid}`);
    }

    // Set privileged claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      orgId: 'org-mospi',
      isPrivileged: true
    });
    console.log(`✓ Assigned custom claims: role=admin, orgId=org-mospi`);

    // Sync Firestore profile
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: adminEmail,
      displayName: userRecord.displayName || 'Master Admin',
      role: 'admin',
      organizationId: 'org-mospi',
      organizationName: 'Ministry of Statistics & Programme Implementation',
      isActive: true,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log('✅ Admin bootstrap complete. Master admin is active.');
  } catch (err) {
    console.warn('Note: Run with Firebase Admin credentials or against running Auth Emulator.');
    console.log(`Target email: ${adminEmail}`);
  }
}

bootstrap();
