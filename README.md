# 💰 Expense Tracker

A full-stack expense tracking application with advanced features like Goals, Investments, Reports, and Light/Dark theme.

**🌐 Live Demo**: [Coming Soon - Deploy to Vercel]

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

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/adarshjd03/expense-tracker.git
   cd expense-tracker
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure Environment**
   
   Create `.env` in backend folder:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ```

4. **Run the Application**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open in Browser**: http://localhost:5173

---

## 🌐 Deploy to Vercel

### Prerequisites
- Push code to GitHub
- Create Vercel account

### Quick Deploy

**Deploy Backend:**
```bash
vercel --prod
# Set root directory: backend
# Add env: JWT_SECRET, NODE_ENV=production
```

**Deploy Frontend:**
```bash
vercel --prod
# Set root directory: frontend
# Add env: VITE_API_URL=https://your-backend-url.vercel.app/api
```

📖 **Detailed deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📱 Usage

1. **Sign Up** - Create a new account
2. **Add Transactions** - Track your daily income and expenses
3. **Set Goals** - Create savings goals and track progress
4. **Manage Investments** - Track your investment portfolio
5. **Generate Reports** - View detailed spending analysis and export CSV
6. **Toggle Theme** - Switch between light and dark mode

---

## 📂 Project Structure

```
expense-tracker/
├── backend/
│   ├── api/
│   │   └── index.js         # Vercel serverless entry
│   ├── controllers/         # Business logic
│   ├── middleware/          # Auth & error handling
│   ├── routes/             # API routes
│   ├── db.js               # Database configuration
│   └── server.js           # Express app
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios configuration
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth & Theme context
│   │   ├── pages/          # Main pages
│   │   └── App.jsx         # Root component
│   └── dist/               # Build output
├── vercel.json             # Vercel configuration
├── DEPLOYMENT.md           # Deployment guide
└── README.md
```

---

## 🗄️ Database

**Development**: SQLite (file-based)
**Production**: Recommended to use PostgreSQL, MongoDB, or MySQL for Vercel deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for database migration guides.

---

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

---

## 🎨 Theme

The app supports both light and dark themes:
- Toggle button in sidebar and mobile header
- Preference saved to localStorage
- Smooth transitions between themes

---

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Protected API routes
- Environment variables for secrets

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**Adarsh JD**
- GitHub: [@adarshjd03](https://github.com/adarshjd03)
- Repository: [expense-tracker](https://github.com/adarshjd03/expense-tracker)

---

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

---

⭐ **Star this repository if you find it helpful!**

