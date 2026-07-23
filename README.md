# Student Expense Tracker Web Application

A lightweight, fullstack Expense Tracker web application built with Node.js, Express, SQLite (`better-sqlite3`), React 18, Vite, and Tailwind CSS.

## How It Works (Viva Explanation)
This application follows a RESTful client-server architecture where the React frontend communicates with an Express backend via Axios. Authentication is handled using JSON Web Tokens (JWT) and passwords hashed with `bcryptjs`, storing SQLite data locally via `better-sqlite3` for zero-setup persistence. Every database query is strictly scoped to the logged-in user (`WHERE user_id = ?`), allowing users to securely log transactions, view category breakdowns with Recharts, and track income versus expenses.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+)
- **Backend Framework**: Express.js
- **Database**: SQLite via `better-sqlite3` (file-based, synchronous API, zero setup)
- **Authentication**: `jsonwebtoken` (JWT) & `bcryptjs`
- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **HTTP Client**: Axios

---

## 📁 Project Structure

```text
expense-tracker/
├── backend/
│   ├── .env                       # PORT, JWT_SECRET
│   ├── .gitignore                 # node_modules, .env, database.sqlite
│   ├── package.json
│   ├── server.js                  # Express app, CORS, route mounting, error handler
│   ├── db.js                      # SQLite connection + CREATE TABLE IF NOT EXISTS on boot
│   ├── middleware/
│   │   ├── auth.js                # verifyToken middleware
│   │   └── errorHandler.js        # centralized error handler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── transactions.routes.js
│   │   └── categories.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── transactions.controller.js
│   │   └── categories.controller.js
│   └── utils/
│       └── validators.js          # simple input validation helpers
├── frontend/
│   ├── .env                       # VITE_API_URL
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                # routes: /login, /signup, /dashboard (protected)
│       ├── api/
│       │   └── axios.js           # baseURL + auto-attach JWT from localStorage
│       ├── context/
│       │   └── AuthContext.jsx    # user state, login/logout functions
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   └── Dashboard.jsx
│       ├── components/
│       │   ├── ProtectedRoute.jsx
│       │   ├── SummaryCards.jsx
│       │   ├── TransactionForm.jsx
│       │   ├── TransactionList.jsx
│       │   ├── CategoryPieChart.jsx
│       │   └── MonthlyBarChart.jsx
│       └── index.css              # tailwind directives
└── README.md
```

---

## ⚡ Prerequisites

Make sure you have Node.js (v18 or higher) installed on your system.

---

## ⚙️ Installation

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🚀 Running the Application

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs on port **`5000`** (`http://localhost:5000`)*. On boot, it automatically initializes `database.sqlite` and creates all required tables.

2. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs on port **`5173`** (`http://localhost:5173`)*.

---

## 🧪 Manual Testing Checklist

1. **Signup**: Register a new user (`name`, `email`, `password`). Verify auto-seeding of default categories (Food, Rent, Travel, Shopping, Salary, Other).
2. **Login**: Login with the newly created user credentials and verify JWT storage in `localStorage`.
3. **Add Transaction**: Add income and expense items using `TransactionForm`.
4. **Dashboard Verification**: Check that `SummaryCards` updates Balance/Income/Expense immediately and charts (`CategoryPieChart` & `MonthlyBarChart`) render data correctly.
5. **Filters**: Filter transactions by type (income/expense), category, or date range.
6. **Edit & Delete**: Edit a transaction note/amount; delete a transaction with the confirmation prompt.
7. **Persistence & Security**: Log out, log back in, and verify data persists. Check that another user cannot view or alter your transactions.

---

## 🔒 Known Deployment Limitations

- **Secrets**: Change `JWT_SECRET` in `backend/.env` to a strong random key before deploying to production.
- **CORS Origin**: Currently `app.use(cors())` permits all origins for ease of development; restrict this to your actual production frontend URL in production (`cors({ origin: 'https://your-frontend.com' })`).
- **Database**: SQLite is suitable for small-to-medium single-instance setups. For multi-server or serverless deployments (e.g. Vercel/AWS Lambda), switch to a hosted PostgreSQL/MySQL database.
