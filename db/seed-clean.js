const fs = require('fs');
const store = require('./store');

const dbFile = store.DB_PATH;
if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);

const db = {
  courts: [
    { id: 1, name: 'Court 1 - Indoor', indoor: true, enabled: true },
    { id: 2, name: 'Court 2 - Indoor', indoor: true, enabled: true },
    { id: 3, name: 'Court 3 - Outdoor', indoor: false, enabled: true },
    { id: 4, name: 'Court 4 - Outdoor', indoor: false, enabled: true },
  ],
  equipment: [
    { id: 1, name: 'Racket', quantity: 4, fee: 15.0 },
    { id: 2, name: 'Shoes', quantity: 6, fee: 10.0 },
  ],
  coaches: [
    { id: 1, name: 'Coach A' },
    { id: 2, name: 'Coach B' },
    { id: 3, name: 'Coach C' },
  ],
  coach_availability: [],
  pricing_rules: [
    { id: 1, name: 'Peak hours 18:00-21:00', type: 'time_range', criteria: { start: '18:00', end: '21:00' }, multiplier: 1.5, flat_fee: 0 },
    { id: 2, name: 'Weekend multiplier', type: 'day_of_week', criteria: { days: [0,6] }, multiplier: 1.25, flat_fee: 0 },
    { id: 3, name: 'Indoor court premium', type: 'court_property', criteria: { indoor: true }, multiplier: 1.1, flat_fee: 0 },
    { id: 4, name: 'Coach flat fee', type: 'coach_fee', criteria: {}, multiplier: 1.0, flat_fee: 20 },
  ],
  bookings: [],
  booking_equipment: [],
  booking_coach: [],
};

for (let coach_id = 1; coach_id <= 3; coach_id++) {
  for (let day = 0; day < 7; day++) {
    db.coach_availability.push({ id: db.coach_availability.length + 1, coach_id, day_of_week: day, start_time: '07:00', end_time: '21:00' });
  }
}

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
console.log('DB seeded into', dbFile);
