const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

function load() {
  if (!fs.existsSync(DB_PATH)) return { courts: [], equipment: [], coaches: [], coach_availability: [], pricing_rules: [], bookings: [], booking_equipment: [], booking_coach: [] };
  const txt = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(txt || '{}');
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function nextId(arr) {
  return arr.reduce((max, x) => Math.max(max, x.id || 0), 0) + 1;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h*60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(aEnd) > new Date(bStart);
}

const store = {
  load,
  save,
  DB_PATH,
  nextId,
  timeToMinutes,
  overlaps,
  getAll: (collectionName) => load()[collectionName] || [],
  getById: (collectionName, id) => (load()[collectionName] || []).find(r => r.id === id),
  writeItem: (collectionName, item) => {
    const db = load();
    const arr = db[collectionName] || [];
    arr.push(item);
    db[collectionName] = arr;
    save(db);
    return item;
  },
  updateItem: (collectionName, id, updates) => {
    const db = load();
    const arr = db[collectionName] || [];
    const idx = arr.findIndex(r => r.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...updates };
    db[collectionName] = arr;
    save(db);
    return arr[idx];
  },
};

module.exports = store;
