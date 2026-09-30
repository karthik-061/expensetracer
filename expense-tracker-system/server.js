const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const EXPENSES_FILE = path.join(__dirname, 'expenses.json');
const BUDGET_FILE = path.join(__dirname, 'budget.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Helper: Safely read JSON file
function readJsonFile(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultData;
  }
}

// Helper: Safely write JSON file
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err.message);
    return false;
  }
}

// -------------------------------------------------------------
// ROUTES: Expenses
// -------------------------------------------------------------

// GET all expenses (with optional query filters)
app.get('/api/expenses', (req, res) => {
  let expenses = readJsonFile(EXPENSES_FILE, []);
  const { search, category, startDate, endDate, sortBy, sortOrder } = req.query;

  if (search) {
    const q = search.toLowerCase();
    expenses = expenses.filter(
      (e) =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        (e.paymentMethod && e.paymentMethod.toLowerCase().includes(q))
    );
  }

  if (category && category !== 'All') {
    expenses = expenses.filter((e) => e.category === category);
  }

  if (startDate) {
    expenses = expenses.filter((e) => e.date >= startDate);
  }

  if (endDate) {
    expenses = expenses.filter((e) => e.date <= endDate);
  }

  // Sorting
  const order = sortOrder === 'asc' ? 1 : -1;
  if (sortBy === 'amount') {
    expenses.sort((a, b) => (Number(a.amount) - Number(b.amount)) * order);
  } else if (sortBy === 'title') {
    expenses.sort((a, b) => a.title.localeCompare(b.title) * order);
  } else {
    // Default sort by date desc
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  res.json({ success: true, count: expenses.length, data: expenses });
});

// POST create expense
app.post('/api/expenses', (req, res) => {
  const { title, amount, category, date, paymentMethod, notes } = req.body;

  if (!title || amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid title and positive numeric amount are required.',
    });
  }

  const expenses = readJsonFile(EXPENSES_FILE, []);
  const newExpense = {
    id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: String(title).trim(),
    amount: parseFloat(Number(amount).toFixed(2)),
    category: category || 'Others',
    date: date || new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Credit Card',
    notes: notes ? String(notes).trim() : '',
  };

  expenses.unshift(newExpense);
  const ok = writeJsonFile(EXPENSES_FILE, expenses);

  if (!ok) {
    return res.status(500).json({ success: false, message: 'Failed to save expense.' });
  }

  res.status(201).json({ success: true, data: newExpense });
});

// PUT update expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date, paymentMethod, notes } = req.body;

  const expenses = readJsonFile(EXPENSES_FILE, []);
  const index = expenses.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Expense not found.' });
  }

  const existing = expenses[index];
  const updatedExpense = {
    ...existing,
    title: title !== undefined ? String(title).trim() : existing.title,
    amount: amount !== undefined ? parseFloat(Number(amount).toFixed(2)) : existing.amount,
    category: category !== undefined ? category : existing.category,
    date: date !== undefined ? date : existing.date,
    paymentMethod: paymentMethod !== undefined ? paymentMethod : existing.paymentMethod,
    notes: notes !== undefined ? String(notes).trim() : existing.notes,
  };

  expenses[index] = updatedExpense;
  const ok = writeJsonFile(EXPENSES_FILE, expenses);

  if (!ok) {
    return res.status(500).json({ success: false, message: 'Failed to update expense.' });
  }

  res.json({ success: true, data: updatedExpense });
});

// DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const expenses = readJsonFile(EXPENSES_FILE, []);
  const filtered = expenses.filter((e) => e.id !== id);

  if (filtered.length === expenses.length) {
    return res.status(404).json({ success: false, message: 'Expense not found.' });
  }

  const ok = writeJsonFile(EXPENSES_FILE, filtered);
  if (!ok) {
    return res.status(500).json({ success: false, message: 'Failed to delete expense.' });
  }

  res.json({ success: true, message: 'Expense deleted successfully.' });
});

// -------------------------------------------------------------
// ROUTES: Budget
// -------------------------------------------------------------

// GET budget configuration
app.get('/api/budget', (req, res) => {
  const budget = readJsonFile(BUDGET_FILE, {
    monthlyBudget: 5000,
    currency: '$',
    categories: {},
  });
  res.json({ success: true, data: budget });
});

// POST / PUT update budget
app.post('/api/budget', (req, res) => {
  const currentBudget = readJsonFile(BUDGET_FILE, {
    monthlyBudget: 5000,
    currency: '$',
    categories: {},
  });

  const { monthlyBudget, currency, categories } = req.body;

  const newBudget = {
    monthlyBudget:
      monthlyBudget !== undefined && !isNaN(monthlyBudget)
        ? parseFloat(Number(monthlyBudget).toFixed(2))
        : currentBudget.monthlyBudget,
    currency: currency || currentBudget.currency || '$',
    categories: categories ? { ...currentBudget.categories, ...categories } : currentBudget.categories,
  };

  const ok = writeJsonFile(BUDGET_FILE, newBudget);
  if (!ok) {
    return res.status(500).json({ success: false, message: 'Failed to update budget settings.' });
  }

  res.json({ success: true, data: newBudget });
});

// -------------------------------------------------------------
// ROUTES: Analytics Summary
// -------------------------------------------------------------
app.get('/api/analytics', (req, res) => {
  const expenses = readJsonFile(EXPENSES_FILE, []);
  const budget = readJsonFile(BUDGET_FILE, {
    monthlyBudget: 5000,
    currency: '$',
    categories: {},
  });

  const totalSpent = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const remainingBudget = budget.monthlyBudget - totalSpent;
  const percentageUsed = budget.monthlyBudget > 0 ? (totalSpent / budget.monthlyBudget) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = {};
  for (const exp of expenses) {
    const cat = exp.category || 'Others';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = {
        spent: 0,
        count: 0,
        allocated: budget.categories[cat] || 0,
      };
    }
    categoryBreakdown[cat].spent += Number(exp.amount) || 0;
    categoryBreakdown[cat].count += 1;
  }

  // Ensure categories with allocations also appear
  Object.keys(budget.categories || {}).forEach((cat) => {
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = {
        spent: 0,
        count: 0,
        allocated: budget.categories[cat],
      };
    }
  });

  // Calculate percentages and roundings
  Object.keys(categoryBreakdown).forEach((cat) => {
    const item = categoryBreakdown[cat];
    item.spent = parseFloat(item.spent.toFixed(2));
    item.percentageOfBudget = item.allocated > 0 ? parseFloat(((item.spent / item.allocated) * 100).toFixed(1)) : 0;
    item.percentageOfTotal = totalSpent > 0 ? parseFloat(((item.spent / totalSpent) * 100).toFixed(1)) : 0;
  });

  // Payment method breakdown
  const paymentBreakdown = {};
  for (const exp of expenses) {
    const method = exp.paymentMethod || 'Other';
    paymentBreakdown[method] = (paymentBreakdown[method] || 0) + (Number(exp.amount) || 0);
  }

  // Daily spend trend (sorted by date)
  const dailySpendMap = {};
  expenses.forEach((e) => {
    dailySpendMap[e.date] = (dailySpendMap[e.date] || 0) + (Number(e.amount) || 0);
  });
  const dailySpend = Object.keys(dailySpendMap)
    .sort()
    .map((date) => ({ date, amount: parseFloat(dailySpendMap[date].toFixed(2)) }));

  res.json({
    success: true,
    data: {
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      monthlyBudget: budget.monthlyBudget,
      remainingBudget: parseFloat(remainingBudget.toFixed(2)),
      percentageUsed: parseFloat(percentageUsed.toFixed(1)),
      currency: budget.currency || '$',
      categoryBreakdown,
      paymentBreakdown,
      dailySpend,
      totalTransactions: expenses.length,
    },
  });
});

// Export CSV endpoint
app.get('/api/export/csv', (req, res) => {
  const expenses = readJsonFile(EXPENSES_FILE, []);
  let csv = 'ID,Date,Title,Category,Amount,Payment Method,Notes\n';

  expenses.forEach((e) => {
    const safeTitle = `"${(e.title || '').replace(/"/g, '""')}"`;
    const safeNotes = `"${(e.notes || '').replace(/"/g, '""')}"`;
    const safeMethod = `"${(e.paymentMethod || '').replace(/"/g, '""')}"`;
    csv += `${e.id},${e.date},${safeTitle},${e.category},${e.amount},${safeMethod},${safeNotes}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses_export.csv"');
  res.status(200).send(csv);
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  EXPENSE TRACKER SYSTEM SERVER STARTED`);
  console.log(`  Local Address: http://localhost:${PORT}`);
  console.log(`  Data Storage:`);
  console.log(`    - Expenses: ${EXPENSES_FILE}`);
  console.log(`    - Budget:   ${BUDGET_FILE}`);
  console.log(`====================================================`);
});
