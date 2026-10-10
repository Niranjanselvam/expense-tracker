# Personal Finance Tracker

A full-stack web application for tracking income and expenses with data visualization, monthly reports, and CSV export functionality.

## Features

✨ **Core Features:**
- 📝 Add, edit, and delete transactions (income/expense)
- 📊 Interactive charts and visualizations using Chart.js
- 📅 Monthly financial reports with category breakdown
- 🔍 Filter transactions by type, category, and date range
- 📥 Export transactions to CSV format

📚 **Learning Outcomes:**
- **Data Visualization**: Chart.js for creating interactive financial charts (Pie, Line charts)
- **API Design**: RESTful API design patterns for CRUD operations, filtering, and aggregation
- **Full-Stack Development**: Node.js + Express backend, React frontend, SQLite database
- **Database Queries**: SQL queries for aggregation, filtering, and date range selection

## Tech Stack

**Backend:**
- Node.js + Express.js
- SQLite3 (Local database)
- CORS enabled for frontend communication

**Frontend:**
- React 18
- Chart.js with react-chartjs-2
- Axios for API calls
- date-fns for date utilities

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── server.js          # Express app setup
│   │   ├── models/
│   │   │   └── transaction.js # Database queries
│   │   ├── routes/
│   │   │   └── transactions.js # API endpoints
│   │   └── utils/
│   │       └── database.js    # Database initialization
│   ├── package.json
│   ├── .env.example
│   └── finance.db             # SQLite database (created on first run)
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # React entry point
│   │   ├── components/
│   │   │   ├── TransactionForm.js
│   │   │   ├── TransactionList.js
│   │   │   ├── Charts.js
│   │   │   ├── MonthlyReport.js
│   │   │   └── Filters.js
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── styles/
│   │   │   ├── App.css
│   │   │   ├── TransactionForm.css
│   │   │   ├── Charts.css
│   │   │   ├── Filters.css
│   │   │   ├── MonthlyReport.css
│   │   │   ├── TransactionList.css
│   │   │   └── index.css
│   │   └── public/
│   │       └── index.html
│   └── package.json
│
├── .gitignore
├── README.md
└── .github/
    └── copilot-instructions.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Start the backend server:
```bash
npm start
```

The API server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## API Endpoints

### Transactions

- **GET** `/api/transactions` - Get all transactions (with optional filters)
  - Query parameters: `type`, `category`, `startDate`, `endDate`
  
- **GET** `/api/transactions/:id` - Get transaction by ID

- **POST** `/api/transactions` - Create new transaction
  - Body: `{ type, category, amount, description, date }`

- **PUT** `/api/transactions/:id` - Update transaction
  - Body: `{ type, category, amount, description, date }`

- **DELETE** `/api/transactions/:id` - Delete transaction

### Reports & Exports

- **GET** `/api/transactions/summary/monthly/:year/:month` - Get monthly summary

- **GET** `/api/transactions/categories/:type` - Get categories by type

- **GET** `/api/transactions/export/csv` - Export transactions to CSV
  - Query parameters: `type`, `category`, `startDate`, `endDate`

### Health Check

- **GET** `/api/health` - Check API status

## Usage

### Adding Transactions

1. Click the transaction form in the sidebar
2. Select type (Income/Expense)
3. Choose category from dropdown
4. Enter amount and date
5. Add optional description
6. Click "Save Transaction"

### Viewing Charts

The Charts section displays:
- Total income vs expenses (Pie chart)
- Expense breakdown by category
- 30-day trend line chart

### Monthly Reports

- Navigate between months using Previous/Next buttons
- View total income, expenses, and net income
- See expense breakdown by category

### Filtering Data

Use the Filters section to:
- Filter by transaction type (Income/Expense)
- Set date range (start and end date)
- Export filtered data as CSV

### CSV Export

1. Set desired filters
2. Click "Export CSV"
3. File downloads as `transactions-{date}.csv`

## Database Schema

### Transactions Table

```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,              -- 'income' or 'expense'
  category TEXT NOT NULL,          -- e.g., 'Salary', 'Food'
  amount REAL NOT NULL,            -- Transaction amount
  description TEXT,                -- Optional description
  date TEXT NOT NULL,              -- ISO date format (YYYY-MM-DD)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Key Features Explained

### 1. Data Visualization
- Uses Chart.js for interactive charts
- Pie charts for income vs expense breakdown
- Line charts for trend analysis
- Real-time updates as data changes

### 2. API Design
- RESTful endpoints following best practices
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Query parameter filtering
- JSON request/response format
- Error handling with meaningful messages

### 3. Filtering System
- Type filter (income/expense)
- Category filter (dynamic based on type)
- Date range filtering
- Combines multiple filters with AND logic

### 4. CSV Export
- Generates properly formatted CSV
- Includes headers and quoted fields
- Respects applied filters
- Downloads with timestamp

## Development

### Adding New Features

1. **Backend**: Add routes in `backend/src/routes/`
2. **Frontend**: Create new React components
3. **Database**: Modify schema in `backend/src/utils/database.js`

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

Frontend:
```bash
cd frontend
npm start    # React scripts with hot reload
```

## Learning Points

### Data Visualization
- Chart.js configuration and chart types
- Real-time chart updates from API data
- Responsive chart layouts

### API Design
- Resource-based routing
- Query parameter design
- Aggregation queries for reports
- CSV generation from database queries

### Full-Stack Integration
- Frontend-backend communication with Axios
- State management in React
- Database transactions and queries
- Error handling across layers

## Future Enhancements

- 🔐 User authentication and authorization
- 💾 Cloud database integration
- 📱 Mobile-responsive improvements
- 📧 Email reports
- 🏷️ Budget tracking and alerts
- 📈 Recurring transactions
- 💱 Multi-currency support
- 📊 Advanced analytics and forecasting

## Troubleshooting

**Port already in use:**
```bash
# Change port in backend/.env
PORT=5001
```

**Database locked:**
- Close other instances of the app
- Delete `finance.db` and restart (will create fresh database)

**CORS errors:**
- Ensure backend is running on port 5000
- Check frontend `.env` for correct API_URL

## License

MIT License - Feel free to use this project for learning and personal use.

## Support

For issues or questions, check the code comments and API documentation in the respective files.

Happy tracking! 💰
