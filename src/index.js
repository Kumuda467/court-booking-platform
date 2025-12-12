const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('../db/data-helpers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Simple endpoints
app.get('/api/courts', async (req, res) => {
  const rows = db.dbLoad().courts.filter(c => c.enabled);
  res.json(rows);
});

app.get('/api/equipment', async (req, res) => {
  const rows = db.dbLoad().equipment;
  res.json(rows);
});

app.get('/api/coaches', async (req, res) => {
  const rows = db.dbLoad().coaches;
  res.json(rows);
});

// Availability endpoint returns per court and time slots availability for a date
// Query params: date=YYYY-MM-DD
app.get('/api/availability', (req, res) => {
  const date = req.query.date;
  if (!date) return res.status(400).json({ error: 'date required as YYYY-MM-DD' });
  const dbdata = db.dbLoad();
  const bookings = (dbdata.bookings || []).filter(b => b.start.startsWith(date) || b.end.startsWith(date));
  res.json({ date, bookings });
});

// Price calculation endpoint
app.post('/api/price', (req, res) => {
  const { court_id, start, end, equipment_ids = [], coach_id } = req.body;
  if (!court_id || !start || !end) return res.status(400).json({ error: 'court_id, start and end are required' });
  const priceBreakdown = db.calcPrice(court_id, start, end, equipment_ids, coach_id);
  res.json(priceBreakdown);
});

// Create booking (atomic)
app.post('/api/book', (req, res) => {
  const { user_name, user_email, court_id, start, end, equipment = [], coach_id } = req.body;
  if (!user_name || !user_email || !court_id || !start || !end) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  try {
    const result = db.createBooking({ user_name, user_email, court_id, start, end, equipment, coach_id });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/bookings', (req, res) => {
  const dbdata = db.dbLoad();
  const rows = (dbdata.bookings || []).slice().sort((a, b) => new Date(b.start) - new Date(a.start)).slice(0, 100).map(b => ({ ...b, court_name: (dbdata.courts.find(c => c.id === b.court_id) || {}).name }));
  res.json(rows);
});

app.listen(PORT, () => {
  console.log(`Court booking backend running on port ${PORT}`);
});
