# Backend - Court Booking Platform

This backend uses Node.js + Express and a simple JSON file store (no native DB dependencies). It's minimal but fully functional for the assignment and easier to run on Windows without build tools.

Setup and run:

1. Install dependencies

```bash
cd backend
npm install
```

2. Seed the database (creates db/data.json)

```bash
npm run seed
```

3. Run the server

```bash
npm run start
# or for development with auto reload
npm run dev
```

Server will run on http://localhost:4000

API endpoints:
- GET /api/courts
- GET /api/equipment
- GET /api/coaches
- GET /api/availability?date=YYYY-MM-DD
- GET /api/bookings
- POST /api/price { court_id, start, end, equipment_ids[], coach_id }
- POST /api/book { user_name, user_email, court_id, start, end, equipment: [{id, qty}], coach_id }

Demo (curl):

```bash
curl http://localhost:4000/api/courts

curl -X POST http://localhost:4000/api/price -H "Content-Type: application/json" -d "{ \"court_id\":1, \"start\": \"2025-12-15T18:00:00\", \"end\": \"2025-12-15T19:00:00\", \"equipment_ids\": [1], \"coach_id\": 1 }"

curl -X POST http://localhost:4000/api/book -H "Content-Type: application/json" -d "{ \"user_name\": \"Test\", \"user_email\": \"test@local\", \"court_id\":1, \"start\": \"2025-12-15T18:00:00\", \"end\": \"2025-12-15T19:00:00\", \"equipment\": [{ \"id\": 1, \"qty\": 1 }], \"coach_id\": 1 }"
```

Notes and assumptions:
- Pricing engine is based on configurable rules from the `pricing_rules` table.
- Equipment quantities are enforced across overlapping bookings.
- Coach weekly availability is supported; here we seed coaches as available 07:00-21:00.
This uses a JSON file datastore for portability during the demo. For production you'd swap this for Postgres/MySQL and proper transactions.
"# court-booking-platform" 
