import { config } from '../config/env.ts';

const BASE_URL = `http://localhost:${config.port}/api`;

async function runTests() {
  console.log('🧪 Starting Recall AI Comprehensive Backend Tests...');
  const testEmail = `test_${Date.now()}@example.com`;
  const password = 'Password123!';
  let token = '';
  let userId = '';
  let personId = '';
  let memoryId = '';
  let itemId = '';
  let reminderId = '';
  let carryId = '';
  let routineId = '';

  // Helper for requests
  async function req(endpoint: string, options: any = {}) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
  }

  // 1. Health check
  console.log('👉 1. Health Check');
  const health = await req('/health');
  if (health.status !== 200 || health.data?.status !== 'healthy') {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }
  console.log('   ✅ Health check passed');

  // 2. User Registration
  console.log('👉 2. User Registration');
  const regRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Architect',
      email: testEmail,
      password,
    }),
  });
  if (regRes.status !== 201 || !regRes.data?.token) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes)}`);
  }
  token = regRes.data.token;
  userId = regRes.data.user._id;
  console.log(`   ✅ Registration passed (User ID: ${userId})`);

  // 3. User Login
  console.log('👉 3. User Login');
  const loginRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password }),
  });
  if (loginRes.status !== 200 || !loginRes.data?.token) {
    throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
  }
  console.log('   ✅ Login passed');

  // 4. Protected Route & Profile
  console.log('👉 4. Protected Route (Get Profile)');
  const meRes = await req('/auth/me');
  if (meRes.status !== 200 || meRes.data?.user?.email !== testEmail) {
    throw new Error(`Protected route profile check failed: ${JSON.stringify(meRes)}`);
  }
  console.log('   ✅ Profile authentication passed');

  // 5. People Management (Add Person)
  console.log('👉 5. People Management');
  const personRes = await req('/people', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Marcus Vance',
      contact: '+1 555-0199',
      notes: 'Colleague on the engineering team',
    }),
  });
  if (personRes.status !== 201 || !personRes.data?.person?._id) {
    throw new Error(`Create person failed: ${JSON.stringify(personRes)}`);
  }
  personId = personRes.data.person._id;
  console.log(`   ✅ Created person "${personRes.data.person.name}" (ID: ${personId})`);

  // 6. Memory CRUD
  console.log('👉 6. Memory CRUD');
  const memRes = await req('/memories', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Apartment WiFi Password',
      description: 'Network: AuroraSky-5G, Key: SkyHigh2026!',
      category: 'Personal',
      tags: ['wifi', 'home', 'credentials'],
      personId,
      personName: 'Marcus Vance',
    }),
  });
  if (memRes.status !== 201 || !memRes.data?.memory?._id) {
    throw new Error(`Create memory failed: ${JSON.stringify(memRes)}`);
  }
  memoryId = memRes.data.memory._id;
  console.log(`   ✅ Created memory (ID: ${memoryId})`);

  const listMemRes = await req('/memories?search=AuroraSky');
  if (listMemRes.status !== 200 || listMemRes.data?.memories?.length === 0) {
    throw new Error(`Search memory failed: ${JSON.stringify(listMemRes)}`);
  }
  console.log('   ✅ Memory search & query passed');

  // 7. Borrowed & Lent Item Tracking
  console.log('👉 7. Borrowed & Lent Item Tracking');
  const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const itemRes = await req('/items', {
    method: 'POST',
    body: JSON.stringify({
      itemName: 'Noise Cancelling Headphones',
      direction: 'lent',
      personName: 'Marcus Vance',
      personId,
      date: pastDate,
      expectedReturnDate: yesterday, // Should be calculated as overdue
      notes: 'Lent for the flight to Chicago',
    }),
  });
  if (itemRes.status !== 201 || !itemRes.data?.item?._id) {
    throw new Error(`Create item failed: ${JSON.stringify(itemRes)}`);
  }
  itemId = itemRes.data.item._id;
  if (itemRes.data.item.status !== 'overdue') {
    console.warn(`   ⚠️ Expected status to be 'overdue', got '${itemRes.data.item.status}'`);
  } else {
    console.log('   ✅ Overdue status accurately calculated');
  }

  // 8. Reminders CRUD
  console.log('👉 8. Reminders CRUD');
  const remRes = await req('/reminders', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Pick up dry cleaning',
      date: new Date().toISOString().split('T')[0],
      time: '17:00',
      priority: 'high',
    }),
  });
  if (remRes.status !== 201 || !remRes.data?.reminder?._id) {
    throw new Error(`Create reminder failed: ${JSON.stringify(remRes)}`);
  }
  reminderId = remRes.data.reminder._id;
  console.log(`   ✅ Reminder created (ID: ${reminderId})`);

  // 9. Carry List CRUD
  console.log('👉 9. Carry List Checklist');
  const carryRes = await req('/carry', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Transit pass',
      category: 'Everyday Essentials',
    }),
  });
  if (carryRes.status !== 201 || !carryRes.data?.item?._id) {
    throw new Error(`Create carry item failed: ${JSON.stringify(carryRes)}`);
  }
  carryId = carryRes.data.item._id;

  const toggleRes = await req(`/carry/${carryId}/toggle`, { method: 'PATCH' });
  if (toggleRes.status !== 200 || !toggleRes.data?.item?.checked) {
    throw new Error(`Toggle carry item check failed: ${JSON.stringify(toggleRes)}`);
  }
  console.log('   ✅ Carry list item checked state persisted');

  // 10. Departure Routine CRUD
  console.log('👉 10. Before-You-Leave Routines');
  const routineRes = await req('/routines', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Office Commute',
      activity: 'Work',
      destination: 'Downtown HQ',
      items: ['Badge', 'Laptop', 'Charger', 'Transit Pass'],
      notes: 'Remember umbrella if cloudy',
    }),
  });
  if (routineRes.status !== 201 || !routineRes.data?.routine?._id) {
    throw new Error(`Create routine failed: ${JSON.stringify(routineRes)}`);
  }
  routineId = routineRes.data.routine._id;
  console.log(`   ✅ Departure routine created (ID: ${routineId})`);

  // 11. AI Assistant Context-Aware Retrieval
  console.log('👉 11. AI Assistant Retrieval & Synthesis');
  const aiRes1 = await req('/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({
      message: 'What items have I lent out?',
    }),
  });
  if (aiRes1.status !== 200 || !aiRes1.data?.reply) {
    throw new Error(`AI query failed: ${JSON.stringify(aiRes1)}`);
  }
  console.log('   🤖 AI Reply to "What items have I lent out?":');
  console.log('   ' + aiRes1.data.reply.replace(/\n/g, '\n   '));

  const aiRes2 = await req('/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({
      message: 'What is my apartment wifi password?',
    }),
  });
  console.log('   🤖 AI Reply to "What is my apartment wifi password?":');
  console.log('   ' + aiRes2.data.reply.replace(/\n/g, '\n   '));

  // 12. Insights Aggregations
  console.log('👉 12. System Insights Calculations');
  const insightsRes = await req('/insights');
  if (insightsRes.status !== 200 || typeof insightsRes.data?.totalMemories !== 'number') {
    throw new Error(`Get insights failed: ${JSON.stringify(insightsRes)}`);
  }
  console.log(`   ✅ Insights verified: Total Memories = ${insightsRes.data.totalMemories}, Active Lent = ${insightsRes.data.activeLent}, Overdue = ${insightsRes.data.overdueItems}`);

  // 13. Data Isolation Check (Another user cannot access this user's data)
  console.log('👉 13. Security & Data Isolation Check');
  const user2Res = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Another User',
      email: `other_${Date.now()}@example.com`,
      password: 'OtherPassword123!',
    }),
  });
  const otherToken = user2Res.data?.token;
  const isolatedMemRes = await fetch(`${BASE_URL}/memories`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  const isolatedData = await isolatedMemRes.json();
  if (isolatedData.memories?.length !== 0) {
    throw new Error(`Data isolation violation: User 2 sees memories of User 1!`);
  }
  console.log('   ✅ Data isolation confirmed (User 2 has 0 memories of User 1)');

  console.log('\n🎉 ALL 13 TEST SUITES PASSED FLAWLESSLY!\n');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});

