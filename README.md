# PriceTracker

Tracks product prices in online stores and stores there price history. Add a product url to the app, and a scraper gathers the data every time interval so you can it's price history.

## Why I built it

Manually checking prices takes time and the site that i use don't havve support on existing price trackers. The app is for turkish websites.

The simple app gathers all the price history on one app where i can compare the prices myself. You only need the product url from a supported website.

## Architecture

```
┌─────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│  Mobile app (Expo)  │ ──────────────────────▶ │  API server (Node + TS)  │
│  React Native       │ ◀────────────────────── │  routes/                 │
└─────────────────────┘                          │  productRepository.ts    │
                                                 └────────────┬─────────────┘
                                                              │ Drizzle ORM
                                   ┌──────────────────┐       ▼
                                   │  dailyScraper.ts │ ──▶ ┌──────────┐
                                   │  scraper.ts      │     │ Database │
                                   └──────────────────┘     └──────────┘
```



### Architecture decisions

I used Expo over basic React for the frontend because I wanted to use the app on my phone.

Using typsecript over javascript because it's the most popular.
Same with drizzle over prisma

A repository layer over querying the DB from routes. I find it simpler. There is a daily scraper for the same reason.

Docker is used so the the app is esier to mannage and works on every machine.


## How to use

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js](https://nodejs.org/) 18+ and npm
- For the mobile app: the [Expo Go](https://expo.dev/go) app on your phone, or an Android emulator / iOS simulator

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/PriceTracker.git
cd PriceTracker
```

### 2. Configure environment variables

Create `backend/.env`:

```env
# TODO: replace with the variables your backend actually reads
DATABASE_URL=postgres://postgres:postgres@database:5352/pricetracker
PORT=5643
```

Create `frontend/.env`:

```env
# Use your computer's local IP (not localhost) when testing on a physical phone
EXPO_PUBLIC_API_URL=http://x.x.x.x:5643
```

### 3. Start the backend and database

```bash
docker compose up --build
```

Run the database migrations (first run only):

```bash
cd backend
npx drizzle-kit migrate
```

The API is now available at `http://localhost:5643`.

<details>
<summary>Running the backend without Docker</summary>

```bash
cd backend
npm install
npx drizzle-kit migrate
npm run dev
```

You'll need a database running locally that matches `DATABASE_URL`.
</details>

### 4. Start the mobile app

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android / `i` for iOS.


## License

This project is licensed under the terms in [LICENSE](LICENSE).
