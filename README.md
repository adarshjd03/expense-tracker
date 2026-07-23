# 💰 Expense Tracker

A full-stack expense tracking application with advanced features like Goals, Investments, Reports, and Light/Dark theme.

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with JWT
- 💸 **Transactions** - Track income and expenses with categories
- 🎯 **Goals** - Set and track savings goals with progress bars
- 📈 **Investments** - Manage investment portfolio with ROI calculations
- 📊 **Reports** - Generate detailed expense reports with CSV export
- 🌓 **Light/Dark Mode** - Toggle between themes with persistence
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router
- Axios
- Recharts (for visualizations)
- Tailwind CSS
- Lucide Icons

**Backend:**
- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT Authentication
- bcryptjs

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/adarshjd03/expense-tracker.git
   cd expense-tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ```

5. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: http://localhost:5000

6. **Start Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

## 📱 Usage

1. **Sign Up** - Create a new account
2. **Add Categories** - Create income/expense categories (auto-created on first use)
3. **Track Transactions** - Add your daily income and expenses
4. **Set Goals** - Create savings goals and track progress
5. **Manage Investments** - Track your investment portfolio
6. **Generate Reports** - View detailed spending analysis and export CSV
7. **Toggle Theme** - Switch between light and dark mode

## 📂 Project Structure

```
expense-tracker/
├── backend/
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth & error handling
│   ├── routes/          # API routes
│   ├── utils/           # Validators
│   ├── db.js            # Database configuration
│   └── server.js        # Express app
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios configuration
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth & Theme context
│   │   ├── pages/       # Main pages
│   │   └── App.jsx      # Root component
│   └── index.html
└── README.md
```

## 🗄️ Database

The application uses SQLite for data storage. The database file (`database.sqlite`) is automatically created in the backend folder on first run.

**Tables:**
- `users` - User accounts
- `categories` - Income/expense categories
- `transactions` - Financial transactions
- `goals` - Savings goals
- `investments` - Investment portfolio

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- Protected API routes
- Environment variables for sensitive data

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `POST /api/goals/:id/contribute` - Add contribution
- `DELETE /api/goals/:id` - Delete goal

### Investments
- `GET /api/investments` - Get all investments
- `POST /api/investments` - Create investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

### Reports
- `GET /api/reports` - Generate expense report

## 🎨 Theme

The app supports both light and dark themes:
- Toggle button in sidebar
- Preference saved to localStorage
- Smooth transitions between themes

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Adarsh JD**
- GitHub: [@adarshjd03](https://github.com/adarshjd03)

---

⭐ Star this repository if you find it helpful!
