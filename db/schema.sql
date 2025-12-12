-- Courts
CREATE TABLE IF NOT EXISTS courts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  indoor INTEGER DEFAULT 0,
  enabled INTEGER DEFAULT 1
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  fee REAL NOT NULL DEFAULT 10.0
);

-- Coaches
CREATE TABLE IF NOT EXISTS coaches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- Coach weekly availability (day_of_week 0=Sunday..6=Saturday), HH:MM format for times
CREATE TABLE IF NOT EXISTS coach_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coach_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  FOREIGN KEY (coach_id) REFERENCES coaches(id)
);

-- Pricing rules
CREATE TABLE IF NOT EXISTS pricing_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  criteria TEXT,
  multiplier REAL DEFAULT 1,
  flat_fee REAL DEFAULT 0
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT,
  user_email TEXT,
  court_id INTEGER NOT NULL,
  start TEXT NOT NULL,
  end TEXT NOT NULL,
  price_total REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (court_id) REFERENCES courts(id)
);

-- Booking Equipment
CREATE TABLE IF NOT EXISTS booking_equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  equipment_id INTEGER NOT NULL,
  qty INTEGER DEFAULT 1,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Booking coach (1 coach per booking supported)
CREATE TABLE IF NOT EXISTS booking_coach (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  coach_id INTEGER NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (coach_id) REFERENCES coaches(id)
);

-- Index for bookings date overlap queries
CREATE INDEX IF NOT EXISTS idx_bookings_court_start_end ON bookings(court_id, start, end);
