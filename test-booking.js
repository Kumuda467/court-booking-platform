const axios = require('axios');

const API = 'http://localhost:4000/api';

async function run() {
  const now = new Date();
  now.setHours(18, 0, 0, 0);
  const start = now.toISOString();
  const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  try {
    const r1 = await axios.post(API + '/book', {
      user_name: 'Test 1', user_email: 't1@example.com', court_id: 1, start, end, equipment: [{ id: 1, qty: 1 }], coach_id: 1
    });
    console.log('Booking 1 OK', r1.data);
  } catch (e) {
    console.error('Booking 1 failed', e?.response?.data || e.message);
  }

  try {
    const r2 = await axios.post(API + '/book', {
      user_name: 'Test 2', user_email: 't2@example.com', court_id: 1, start, end, equipment: [{ id: 1, qty: 1 }], coach_id: 1
    });
    console.log('Booking 2 OK', r2.data);
  } catch (e) {
    console.error('Booking 2 failed', e?.response?.data || e.message);
  }
}

run()
