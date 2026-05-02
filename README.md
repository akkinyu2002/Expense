# ExpenseAI

ExpenseAI is a full-stack expense tracker with smart categorization, analytics, voice input, and a customizable dashboard experience.

## Features

- Add expenses with amount, description, category, and date
- Automatic category detection for common spending types
- Dashboard summary cards, category chart, recent expenses, and spending insights
- Voice input through the browser Web Speech API
- Editable settings for theme, accent color, density, currency, budget, default category, voice language, notifications, chart legend, and local drafts
- Firebase Firestore persistence when credentials are configured
- In-memory fallback mode for local backend testing without Firebase credentials
- Express can serve the production client build from the server root

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Chart.js, lucide-react
- Backend: Node.js, Express
- Database: Firebase Firestore

## Project Structure

```text
Expense/
  client/              React/Vite application
  server/              Express API
  Markdown.md          Original build brief
  README.md            Project documentation
```

## Getting Started

Install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

Run the API:

```bash
cd server
npm run dev
```

Run the client:

```bash
cd client
npm run dev
```

By default, the client runs on `http://localhost:5173` and the API runs on `http://localhost:5000`.

## Environment

Create a `.env` file in `server/` for Firebase and CORS settings when needed:

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

Alternatively, provide a service account file path:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

If Firebase credentials are not configured, the backend falls back to mock mode for local development.

For a custom frontend API URL, create `client/.env`:

```bash
VITE_API_URL=http://localhost:5000
```

## API Routes

- `GET /health` - health check
- `POST /expenses` - create an expense
- `GET /expenses` - list expenses with optional filters
- `GET /expenses/summary` - dashboard totals and category summary
- `GET /expenses/insights` - generated spending insights
- `GET /expenses/categories` - available categories
- `DELETE /expenses/:id` - delete an expense

## Production Build

Build the client:

```bash
cd client
npm run build
```

Start the server:

```bash
cd server
npm start
```

When `client/dist` exists, the Express server serves the built frontend and supports direct SPA route visits.

## Verification

```bash
cd client
npm run lint
npm run build
```
