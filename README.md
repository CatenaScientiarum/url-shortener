# url-shortener
Link shortener service 

Start guide
```bash
1. Backend

cd backend

npm install

node index.js

2. frontend

cd frontend

npm install

npm run dev

SQLite does not create missing directories. If ./data/ does not exist, create it.

cd backend
mkdir -p data

Essential

# backend/.env (LOCAL )
PORT=5000 (PORT — port for Express (e.g. 5000))
DATABASE_URL=./data/urls.db

# hCaptcha secret ( HCAPTCHA_SECRET — hCaptcha private secret (hCaptcha Dashboard https://dashboard.hcaptcha.com/))
HCAPTCHA_SECRET=ES_your_hcaptcha_secret_here

