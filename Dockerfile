FROM node:18-bullseye

# No native build tools required; backend uses a JSON datastore

WORKDIR /app

COPY package*.json ./
COPY db ./db
COPY src ./src
COPY ./*.js ./

RUN npm install --no-audit --no-fund

# Seed the database during build (creates /app/db/data.json)
RUN npm run seed || true

EXPOSE 4000
CMD ["npm", "run", "start"]
