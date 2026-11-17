# DerLeng (ដើរលេង)

React + Vite + Tailwind CSS + Framer Motion + @google/genai (gemini-3.8-flash)

## Run
1. Install Node.js (v18+) from https://nodejs.org
2. Open this folder in VS Code, then open the terminal (Ctrl + `)
3. `npm install`
4. Copy `.env.example` to `.env`, paste your Gemini key after `VITE_GEMINI_API_KEY=` (optional; preset demo answers and common translation phrases work without it, but custom translations need a working key)
5. `npm run dev` and open the link it prints (http://localhost:5173)

Restart `npm run dev` after editing `.env`.

## Real photos
Drop JPGs into `public/photos/` named `1.jpg` ... `35.jpg` (see `_LIST.txt`).

## Notes
- Data (listings, reviews, plans) lives in the browser's localStorage. Clear it to reset.
- Sign-up and sign-in are for the class demo only: accounts, passwords, profiles, and host posts are stored in this browser, not a secure authentication service. Use throwaway passwords; password recovery is not available.
- Travelers go directly to Explore after signing in. New community hosts start in Host Studio; after publishing a listing they land on their dashboard, where they can manage their profile, ratings, views, guest replies, and community photo/video updates.
- Host Studio keeps the original listing description and adds its translation as a second language on the preview and published listing. Temporary Gemini 503 errors can be retried without losing either text.
- The key is read in the browser, which is fine for a demo; for production, move Gemini calls to a backend.
