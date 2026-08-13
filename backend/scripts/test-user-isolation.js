import mongoose from 'mongoose';
import generateToken from '../src/utils/generateToken.js';
import User from '../src/models/user.model.js';
import CodingQuestion from '../src/models/codingQuestion.model.js';
import Submission from '../src/models/submission.model.js';
import Progress from '../src/models/progress.model.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/career_prep_hub';

async function runTest() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);

  // 1. Fetch Question Q1
  let q1 = await CodingQuestion.findById('6a7c88e0be76eb473a24e05d');
  if (!q1) q1 = await CodingQuestion.findOne({});
  console.log(`Testing with Question Q1: ${q1.title} (${q1._id})`);

  // 2. Create User A & User B
  const userA_email = 'test_vishwa_' + Date.now() + '@example.com';
  const userB_email = 'test_rahul_' + Date.now() + '@example.com';

  const userA = await User.create({
    name: 'Vishwa Test',
    username: 'vishwa_' + Date.now(),
    email: userA_email,
    password: 'Password123!',
    googleId: 'google_a_' + Date.now(),
  });

  const userB = await User.create({
    name: 'Rahul Test',
    username: 'rahul_' + Date.now(),
    email: userB_email,
    password: 'Password123!',
    googleId: 'google_b_' + Date.now(),
  });

  const tokenA = generateToken(userA);
  const tokenB = generateToken(userB);

  console.log(`User A created: ${userA._id}`);
  console.log(`User B created: ${userB._id}`);

  // 3. User A submits code for Q1 via API
  console.log('\n--- Case 1: User A submits code for Q1 ---');
  const submitResA = await fetch('http://localhost:5000/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      problemId: String(q1._id),
      language: 'javascript',
      code: 'function runningSum(nums) { let sum = 0; return nums.map(x => sum += x); }',
    }),
  });

  const submitDataA = await submitResA.json();
  console.log('Submit Response status:', submitResA.status, submitDataA);
  const subIdA = submitDataA.data?.submissionId || submitDataA.data?._id;
  console.log('Submission ID:', subIdA);

  // Verify Submission in MongoDB has userId = userA._id (NOT null)
  const subDocA = await Submission.findById(subIdA);
  console.log('Submission record in DB userId:', subDocA.userId ? String(subDocA.userId) : 'NULL!');
  if (String(subDocA.userId) !== String(userA._id)) {
    throw new Error(`FAIL: Submission userId ${subDocA.userId} does not match User A ${userA._id}!`);
  }
  console.log('✅ Case 1 PASSED: userId in Submission matches User A MongoDB _id.');

  // Wait for submission completion if queued, or fetch result
  const fetchResA_UserA = await fetch(`http://localhost:5000/api/submissions/${subIdA}`, {
    headers: { 'Authorization': `Bearer ${tokenA}` },
  });
  console.log('\n--- Case 2: User A retrieves their own submission ---');
  console.log('Response status:', fetchResA_UserA.status);
  if (fetchResA_UserA.status !== 200) {
    throw new Error('FAIL: User A was denied access to their own submission!');
  }
  console.log('✅ Case 2 PASSED: User A retrieved their own submission successfully.');

  console.log('\n--- Case 3: User B attempts to access User A submission ---');
  const fetchResA_UserB = await fetch(`http://localhost:5000/api/submissions/${subIdA}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` },
  });
  console.log('Response status:', fetchResA_UserB.status);
  if (fetchResA_UserB.status !== 403) {
    throw new Error(`FAIL: User B should be denied (403), but got status ${fetchResA_UserB.status}`);
  }
  console.log('✅ Case 3 PASSED: User B access denied (403 Forbidden).');

  console.log('\n--- Case 4: Verify Progress record created for User A ---');
  const progA = await Progress.findOne({ user: userA._id, questionId: q1._id, questionType: 'coding' });
  console.log('Progress doc for User A:', progA);
  if (!progA) {
    throw new Error('FAIL: Progress document was not created for User A!');
  }
  console.log('✅ Case 4 PASSED: User A Progress record created and updated.');

  console.log('\n--- Case 5: User B submits Q1 ---');
  const submitResB = await fetch('http://localhost:5000/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`,
    },
    body: JSON.stringify({
      problemId: String(q1._id),
      language: 'python',
      code: 'def solution(): pass',
    }),
  });

  const submitDataB = await submitResB.json();
  const subIdB = submitDataB.data?.submissionId || submitDataB.data?._id;
  const subDocB = await Submission.findById(subIdB);
  console.log('User B Submission record in DB userId:', subDocB.userId);
  if (String(subDocB.userId) !== String(userB._id)) {
    throw new Error('FAIL: User B submission userId mismatch!');
  }

  const progB = await Progress.findOne({ user: userB._id, questionId: q1._id, questionType: 'coding' });
  console.log('Progress doc for User B:', progB);
  if (!progB) {
    throw new Error('FAIL: Progress document was not created for User B!');
  }

  // Cleanup test users & submissions
  await User.deleteMany({ _id: { $in: [userA._id, userB._id] } });
  await Submission.deleteMany({ _id: { $in: [subIdA, subIdB] } });
  await Progress.deleteMany({ user: { $in: [userA._id, userB._id] } });

  console.log('\n========================================');
  console.log('ALL 5 VERIFICATION CASES PASSED SUCCESSFULLY!');
  console.log('========================================');
  await mongoose.disconnect();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
