const http = require('http');
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://xbsrgqdslgcydrkximno.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhic3JncWRzbGdjeWRya3hpbW5vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjgyNDczOCwiZXhwIjoyMTA4NDAwNzM4fQ.UHUVPU2F255Fv1cvYfiD6Md7k7rQwvK4ekLZx-4-VOo'
);

const studentId = '5c72ee02-8802-4334-8036-dca05897c9ca'; // sample@gmail.com
const cookie = 'course_session_user_id=28e59bd5-6acb-448c-82fc-6d67e896a6b8';

function patchStatus(status) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:3000/api/admin/students/${studentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(JSON.stringify({ status }));
    req.end();
  });
}

function getStudents() {
  return new Promise((resolve, reject) => {
    const req = http.request('http://localhost:3000/api/admin/students', {
      headers: { 'Cookie': cookie }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING SUBSCRIPTION MANAGEMENT TEST SUITE ===');

  // STEP 0: Set to revoked first
  console.log('Setting to revoked initially...');
  await patchStatus('revoked');

  // TEST A: Activation
  console.log('\n--- TEST A: Activation ---');
  const actRes = await patchStatus('active');
  console.log('PATCH active HTTP status:', actRes.statusCode, 'Success:', actRes.data.success);
  
  const { data: dbSubA } = await sb.from('subscriptions').select('*').eq('student_id', studentId).single();
  console.log('Supabase status in DB:', dbSubA.status, '(expected: active)');
  if (dbSubA.status !== 'active') throw new Error('Test A failed: DB status not active');

  // Wait 3 seconds to ensure no background reverting occurs
  console.log('Waiting 3 seconds to verify stability...');
  await new Promise(r => setTimeout(r, 3000));
  const { data: dbSubA2 } = await sb.from('subscriptions').select('*').eq('student_id', studentId).single();
  console.log('Supabase status after 3 seconds:', dbSubA2.status, '(expected: active)');
  if (dbSubA2.status !== 'active') throw new Error('Test A failed: DB status reverted');

  // TEST B: Refresh
  console.log('\n--- TEST B: Refresh (GET /api/admin/students) ---');
  const listB = await getStudents();
  const studentB = listB.students.find(s => s.id === studentId);
  console.log('Refreshed student list status:', studentB.subscriptionStatus, '(expected: active)');
  if (studentB.subscriptionStatus !== 'active') throw new Error('Test B failed: List status not active');

  // TEST C: Revocation
  console.log('\n--- TEST C: Revocation ---');
  const revRes = await patchStatus('revoked');
  console.log('PATCH revoked HTTP status:', revRes.statusCode, 'Success:', revRes.data.success);

  const { data: dbSubC } = await sb.from('subscriptions').select('*').eq('student_id', studentId).single();
  console.log('Supabase status in DB:', dbSubC.status, '(expected: revoked)');
  if (dbSubC.status !== 'revoked') throw new Error('Test C failed: DB status not revoked');

  const listC = await getStudents();
  const studentC = listC.students.find(s => s.id === studentId);
  console.log('Refreshed student list status after revoke:', studentC.subscriptionStatus, '(expected: revoked)');
  if (studentC.subscriptionStatus !== 'revoked') throw new Error('Test C failed: List status not revoked');

  // TEST D: Repeated Toggle
  console.log('\n--- TEST D: Repeated Toggle ---');
  await patchStatus('active');
  const { data: dbSubD1 } = await sb.from('subscriptions').select('*').eq('student_id', studentId).single();
  console.log('Toggle 1 (active): DB status =', dbSubD1.status);

  await patchStatus('revoked');
  const { data: dbSubD2 } = await sb.from('subscriptions').select('*').eq('student_id', studentId).single();
  console.log('Toggle 2 (revoked): DB status =', dbSubD2.status);

  await patchStatus('active');
  const { data: dbSubD3 } = await sb.from('subscriptions').select('*').eq('student_id', studentId).single();
  console.log('Toggle 3 (active): DB status =', dbSubD3.status);

  console.log('\n=== ALL 4 TESTS COMPLETED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
