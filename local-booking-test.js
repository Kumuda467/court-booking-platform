const db = require('./db/data-helpers');

async function run() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0, 0); // tomorrow 18:00
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

  try {
    const result = db.createBooking({
      user_name: 'Local Test',
      user_email: 'local@test',
      court_id: 1,
      start: start.toISOString(),
      end: end.toISOString(),
      equipment: [{ id: 1, qty: 1 }],
      coach_id: 1,
    });
    console.log('Booking created (local):', result);
  } catch (err) {
    console.error('Booking failed (local):', err.message);
  }
}

run();
