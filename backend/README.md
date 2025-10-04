Backend for FocusFit (minimal)

Overview
- Express server with MySQL (mysql2) connection pool.
- Endpoints:
  - POST /api/register  { email, name, age, password }
  - POST /api/login     { email, password }
  - GET  /api/health

Quick start
1. Copy `.env.example` to `.env` and set your DB credentials and PORT.
2. Create the database (e.g., `focusfit`) and run `schema.sql` to create the `users` table.
3. Install dependencies:
   npm install
4. Start server in dev mode:
   npm run dev

Notes
- Passwords are hashed using bcryptjs.
- This scaffold returns basic user info on successful login. For production, add JWT or sessions.
- Make sure your frontend sends requests to the correct origin (CORS is enabled). If you serve `index.html` via file://, consider serving static files from this server or configure CORS accordingly.
