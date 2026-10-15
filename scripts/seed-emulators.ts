/**
 * ProjectSetu — Emulator Seeding Script
 * Seeds Firestore emulator with synthetic projects, baselines, observations,
 * milestones, and interventions for reproducible local demonstrations.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-projectsetu.firebaseapp.com',
  projectId: 'demo-projectsetu',
  storageBucket: 'demo-projectsetu.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef123456'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to local firestore emulator
connectFirestoreEmulator(db, '127.0.0.1', 8080);

async function seed() {
  console.log('Seeding ProjectSetu demonstration data to Firestore emulator...');

  // Organizations
  const orgs = [
    {
      id: 'org-nhai',
      name: 'National Highways Authority of India (NHAI)',
      code: 'NHAI',
      type: 'central_psu',
      ministry: 'Ministry of Road Transport and Highways (MoRTH)',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'org-rvnl',
      name: 'Rail Vikas Nigam Limited (RVNL)',
      code: 'RVNL',
      type: 'central_psu',
      ministry: 'Ministry of Railways',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'org-metro',
      name: 'Delhi Metro Rail Corporation (DMRC)',
      code: 'DMRC',
      type: 'spv',
      ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  for (const org of orgs) {
    await setDoc(doc(db, 'organizations', org.id), org);
    console.log(`✓ Seeded organization: ${org.name}`);
  }

  // Users
  const users = [
    {
      uid: 'user-admin-01',
      email: 'admin@mospi.gov.in',
      displayName: 'Rajesh Verma (Admin)',
      role: 'admin',
      organizationId: 'org-mospi',
      organizationName: 'Ministry of Statistics & Programme Implementation',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      uid: 'user-officer-01',
      email: 'officer@ipmd.mospi.gov.in',
      displayName: 'Dr. Sunita Rao (MoSPI IPMD Director)',
      role: 'officer',
      organizationId: 'org-mospi',
      organizationName: 'MoSPI IPMD Portfolio Oversight',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      uid: 'user-agency-01',
      email: 'manager@nhai.gov.in',
      displayName: 'Vikramaditya Singh (Chief Project Manager)',
      role: 'agency_manager',
      organizationId: 'org-nhai',
      organizationName: 'National Highways Authority of India',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      uid: 'user-field-01',
      email: 'engineer@nhai.gov.in',
      displayName: 'Pooja Nair (Resident Executive Engineer)',
      role: 'field_contributor',
      organizationId: 'org-nhai',
      organizationName: 'National Highways Authority of India',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      uid: 'user-auditor-01',
      email: 'auditor@cag.gov.in',
      displayName: 'Arvind Swaminathan (CAG Lead Auditor)',
      role: 'auditor',
      organizationId: 'org-cag',
      organizationName: 'Comptroller and Auditor General of India',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  for (const user of users) {
    await setDoc(doc(db, 'users', user.uid), user);
    console.log(`✓ Seeded user: ${user.displayName} [${user.role}]`);
  }

  console.log('✅ Seeding complete. Emulators ready for SIH26103 evaluation.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
