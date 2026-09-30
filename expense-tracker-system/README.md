# 📊 Expense Tracker System

A modern, full-stack personal finance and expense tracking application with intelligent monthly budget management, dynamic category analytics, and persistent local storage.

---

## ✨ Features

- **Executive Financial Dashboard**:
  - Real-time KPI summary cards: Total Spent, Monthly Budget, Remaining Balance, and Active Records.
  - Visual status indicators with color-coded alerts (Safe, Warning, Exceeded).
  - Dynamic budget consumption progress meter.

- **Visual Analytics with Chart.js**:
  - **Category Distribution Doughnut Chart**: Visual breakdown of expenses across all spending categories.
  - **Daily Spending Velocity Line/Area Chart**: Tracks spending spikes and expenditure trends over time.
  - **Category Budget Utilization Bars**: Real-time threshold monitoring per category.

- **Transaction Management**:
  - Add, edit, and delete expense entries seamlessly.
  - Categorization with distinct icons and badges (Housing, Food & Dining, Utilities, Transportation, Entertainment, Healthcare, Shopping, Travel, etc.).
  - Payment method tagging (Credit Card, Debit Card, Apple Pay, Cash, Bank Transfer).
  - Optional note and context field.

- **Search, Filter & Sort**:
  - Instant live keyword search across merchant title, category, and notes.
  - Filter by spending category.
  - Sort by latest/oldest date, highest/lowest amount, or alphabetical title.

- **Export & Backup**:
  - One-click **Export to CSV** for spreadsheet analysis (Excel, Google Sheets).

- **Data Persistence**:
  - Backed by JSON data stores (`expenses.json` and `budget.json`) — lightweight, zero database setup required, and easy to back up.

- **Containerized**:
  - Production-ready multi-stage `DockerFile` for easy container deployment.

---

## 📁 Project Structure

```text
expense-tracker-system/
│
├── node_modules/         # Installed npm packages & dependencies
├── .gitignore            # Git ignore definitions
├── DockerFile            # Containerization instructions
├── README.md             # Project documentation and guide
├── budget.json           # Budget configuration and category limits
├── expenses.json         # Expense records storage
├── index.html            # High-performance glassmorphism frontend UI
├── package-lock.json     # Exact dependency lockfile
├── package.json          # Project manifest & npm scripts
├── run.txt               # Plain-text quick start reference
└── server.js             # Express.js REST API & static server
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (version 9 or higher)

### 1. Installation
Clone or navigate to the repository folder:
```bash
cd expense-tracker-system
npm install
```

### 2. Start the Application
Run the production server:
```bash
npm start
```
Or start in development mode with live file watch:
```bash
npm run dev
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🐳 Running with Docker

You can containerize and run the application in an isolated environment using Docker:

### Build Image
```bash
docker build -t expense-tracker-system -f DockerFile .
```

### Run Container
```bash
docker run -d -p 3000:3000 --name expense-tracker-app expense-tracker-system
```
Access the application at `http://localhost:3000`.

To stop the container:
```bash
docker stop expense-tracker-app && docker rm expense-tracker-app
```

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | List all expenses (supports `search`, `category`, `sortBy`, `sortOrder`) |
| `POST` | `/api/expenses` | Add a new expense item |
| `PUT` | `/api/expenses/:id` | Update an existing expense item |
| `DELETE` | `/api/expenses/:id` | Remove an expense item |
| `GET` | `/api/budget` | Retrieve budget limits and currency settings |
| `POST` | `/api/budget` | Update monthly budget and category limits |
| `GET` | `/api/analytics` | Get aggregated financial metrics and chart datasets |
| `GET` | `/api/export/csv` | Download all expense records as a CSV file |

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
