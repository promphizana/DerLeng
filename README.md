# DerLeng (ដើរលេង)

React + Vite + Tailwind CSS + Framer Motion + @google/genai (gemini-2.5-flash)

## Run
1. Install Node.js (v18+) from https://nodejs.org
2. Open this folder in VS Code, then open the terminal (Ctrl + `)
3. `npm install`
4. Copy `.env.example` to `.env`, paste your Gemini key after `VITE_GEMINI_API_KEY=` (optional; demo answers work without it)
5. `npm run dev` and open the link it prints (http://localhost:5173)

Restart `npm run dev` after editing `.env`.

## Real photos
Drop JPGs into `public/photos/` named `1.jpg` ... `35.jpg` (see `_LIST.txt`).

## Notes
- Data (listings, reviews, plans) lives in the browser's localStorage. Clear it to reset.
- The key is read in the browser, which is fine for a demo; for production, move Gemini calls to a backend.
