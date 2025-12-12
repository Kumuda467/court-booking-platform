const store = require('./store');
const fs = require('fs');
const path = require('path');

function dbLoad() {
  return store.load();
}

function dbSave(db) {
  store.save(db);
}

function calcPrice(court_id, startStr, endStr, equipment_ids = [], coach_id = null) {
  const db = dbLoad();
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  const minutes = (endDate - startDate) / (1000 * 60);
  const hours = Math.max(0.5, minutes / 60);
  const basePerHour = 100.0;
  let price = basePerHour * hours;
  const breakdown = [{ label: 'Base (court)', amount: price }];

  const rules = db.pricing_rules || [];
  rules.forEach((r) => {
    const type = r.type;
    const criteria = r.criteria || {};
    if (type === 'time_range') {
      const startMin = startDate.getHours() * 60 + startDate.getMinutes();
      const endMin = endDate.getHours() * 60 + endDate.getMinutes();
      const [sh, sm] = r.criteria.start.split(':').map(Number);
      const [eh, em] = r.criteria.end.split(':').map(Number);
      const ruleStart = sh*60 + sm; const ruleEnd = eh*60 + em;
      if (startMin < ruleEnd && endMin > ruleStart) {
        const before = price;
        price = price * r.multiplier + (r.flat_fee || 0);
        breakdown.push({ label: r.name, multiplier: r.multiplier, flat_fee: r.flat_fee || 0, before, after: price });
      }
    } else if (type === 'day_of_week') {
      const day = startDate.getDay();
      if ((criteria.days || []).includes(day)) {
        const before = price;
        price = price * r.multiplier + (r.flat_fee || 0);
        breakdown.push({ label: r.name, multiplier: r.multiplier, flat_fee: r.flat_fee || 0, before, after: price });
      }
    } else if (type === 'court_property') {
      const court = (db.courts || []).find(c => c.id === court_id);
      if (court && criteria.indoor && court.indoor) {
        const before = price;
        price = price * r.multiplier + (r.flat_fee || 0);
        breakdown.push({ label: r.name, multiplier: r.multiplier, flat_fee: r.flat_fee || 0, before, after: price });
      }
    } else if (type === 'coach_fee') {
      if (coach_id) {
        const before = price;
        price = price * r.multiplier + (r.flat_fee || 0);
        breakdown.push({ label: r.name, multiplier: r.multiplier, flat_fee: r.flat_fee || 0, before, after: price });
      }
    }
  });

  let equipmentFee = 0;
  (equipment_ids || []).forEach((eid) => {
    const e = (db.equipment || []).find(x => x.id === eid);
    if (e) { equipmentFee += e.fee; breakdown.push({ label: `Equipment ${e.name}`, amount: e.fee }); }
  });
  price += equipmentFee;
  return { price, breakdown };
}

function isCourtAvailable(court_id, start, end) {
  const db = dbLoad();
  const overlapping = (db.bookings || []).filter(b => b.court_id === court_id && !(b.end <= start || b.start >= end));
  return overlapping.length === 0;
}

function equipmentAvailable(equipment_id, start, end, qty = 1) {
  const db = dbLoad();
  const eq = (db.equipment || []).find(x => x.id === equipment_id);
  if (!eq) throw new Error('Unknown equipment');
  const booked = (db.booking_equipment || []).filter(be => {
    const b = (db.bookings || []).find(bb => bb.id === be.booking_id);
    return be.equipment_id === equipment_id && b && !(b.end <= start || b.start >= end);
  }).reduce((sum, r) => sum + r.qty, 0);
  return (eq.quantity - booked) >= qty;
}

function coachAvailable(coach_id, start, end) {
  const db = dbLoad();
  const day = new Date(start).getDay();
  const startMin = new Date(start).getHours() * 60 + new Date(start).getMinutes();
  const endMin = new Date(end).getHours() * 60 + new Date(end).getMinutes();
  const avail = (db.coach_availability || []).filter(a => a.coach_id === coach_id && a.day_of_week === day);
  const ok = avail.some((a) => {
    const aStart = timeToMinutes(a.start_time);
    const aEnd = timeToMinutes(a.end_time);
    return startMin >= aStart && endMin <= aEnd;
  });
  if (!ok) return false;
  const booked = (db.booking_coach || []).filter(bc => bc.coach_id === coach_id).filter(bc => {
    const b = (db.bookings || []).find(bb => bb.id === bc.booking_id);
    return b && !(b.end <= start || b.start >= end);
  });
  return booked.length === 0;
}

function createBooking({ user_name, user_email, court_id, start, end, equipment = [], coach_id = null }) {
  if (new Date(end) <= new Date(start)) throw new Error('end must be after start');
  const db = dbLoad();
  // availability checks
  if (!isCourtAvailable(court_id, start, end)) throw new Error('Court is not available for chosen time');
  for (const item of equipment) {
    const { id: eid, qty = 1 } = item;
    if (!equipmentAvailable(eid, start, end, qty)) throw new Error(`Equipment (id:${eid}) not available in requested quantity`);
  }
  if (coach_id && !coachAvailable(coach_id, start, end)) throw new Error('Coach not available');

  const calc = calcPrice(court_id, start, end, equipment.map(e => e.id), coach_id);
  const bookingId = (db.bookings || []).reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
  const booking = { id: bookingId, user_name, user_email, court_id, start, end, price_total: calc.price, created_at: new Date().toISOString() };
  db.bookings.push(booking);
  // equipment records
  for (const item of equipment) {
    const eqid = (db.booking_equipment || []).reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
    db.booking_equipment.push({ id: eqid, booking_id: bookingId, equipment_id: item.id, qty: item.qty || 1 });
  }
  if (coach_id) {
    const bcid = (db.booking_coach || []).reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
    db.booking_coach.push({ id: bcid, booking_id: bookingId, coach_id });
  }

  dbSave(db);
  return { bookingId, price: calc.price };
}

module.exports = { dbLoad, dbSave, calcPrice, isCourtAvailable, equipmentAvailable, coachAvailable, createBooking };
