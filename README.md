# LifeHub PWA Prototype

LifeHub is a Progressive Web App with three modules:
- ReceiptVault (warranties/inventory)
- Subscriptions
- Skills exchange

## Stack
- Frontend: React + Firebase Auth + Firebase Storage + Service Worker
- Backend: Node.js + Express + Firebase Admin Firestore
- Database: Firestore

## Local setup
1. Copy `backend/.env.example` to `backend/.env` and fill Firebase Admin values.
2. Copy `frontend/.env.example` to `frontend/.env` and fill Firebase Web App values.
3. Install dependencies:
   - `npm install`
   - `npm run install:all`
4. Start both apps:
   - `npm run dev`
5. Open frontend at `http://localhost:3000`.

## Deploy
- Frontend can be deployed to Vercel or Netlify as a static React build (`npm run build --prefix frontend`).
- Backend can be deployed to Vercel (Node server) or any Node host.
- Set matching environment variables on both services.
