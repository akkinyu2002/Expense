const { getDb } = require('../config/firebase');

// In-memory storage fallback when Firestore is not configured
let inMemoryExpenses = [];
let idCounter = 1;

/**
 * Create a new expense
 */
async function createExpense(expenseData) {
  const db = getDb();

  const expense = {
    amount: parseFloat(expenseData.amount),
    category: expenseData.category || 'Other',
    description: expenseData.description || '',
    date: expenseData.date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  if (db) {
    // Firestore mode
    const docRef = await db.collection('expenses').add(expense);
    return { id: docRef.id, ...expense };
  } else {
    // In-memory fallback
    const memExpense = { id: String(idCounter++), ...expense };
    inMemoryExpenses.push(memExpense);
    return memExpense;
  }
}

/**
 * Update an existing expense by ID
 */
async function updateExpense(id, expenseData) {
  const db = getDb();
  const updates = {
    updatedAt: new Date().toISOString(),
  };

  if (expenseData.amount !== undefined) {
    updates.amount = parseFloat(expenseData.amount);
  }

  if (expenseData.category !== undefined) {
    updates.category = expenseData.category || 'Other';
  }

  if (expenseData.description !== undefined) {
    updates.description = expenseData.description || '';
  }

  if (expenseData.date !== undefined) {
    updates.date = expenseData.date || new Date().toISOString().split('T')[0];
  }

  if (db) {
    const docRef = db.collection('expenses').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }

    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  const index = inMemoryExpenses.findIndex(e => e.id === id);
  if (index === -1) {
    throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
  }

  inMemoryExpenses[index] = {
    ...inMemoryExpenses[index],
    ...updates,
  };

  return inMemoryExpenses[index];
}

/**
 * Get all expenses with optional filters
 */
async function getExpenses(filters = {}) {
  const db = getDb();

  if (db) {
    // Firestore mode
    let query = db.collection('expenses').orderBy('createdAt', 'desc');

    if (filters.category) {
      query = query.where('category', '==', filters.category);
    }

    if (filters.startDate) {
      query = query.where('date', '>=', filters.startDate);
    }

    if (filters.endDate) {
      query = query.where('date', '<=', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(parseInt(filters.limit));
    }

    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(e => (
        e.description?.toLowerCase().includes(search)
        || e.category?.toLowerCase().includes(search)
      ));
    }

    return results;
  } else {
    // In-memory fallback with basic filtering
    let results = [...inMemoryExpenses];

    if (filters.category) {
      results = results.filter(e => e.category === filters.category);
    }

    if (filters.startDate) {
      results = results.filter(e => e.date >= filters.startDate);
    }

    if (filters.endDate) {
      results = results.filter(e => e.date <= filters.endDate);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter(e => (
        e.description?.toLowerCase().includes(search)
        || e.category?.toLowerCase().includes(search)
      ));
    }

    // Sort by createdAt descending
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filters.limit) {
      results = results.slice(0, parseInt(filters.limit));
    }

    return results;
  }
}

/**
 * Delete an expense by ID
 */
async function deleteExpense(id) {
  const db = getDb();

  if (db) {
    const docRef = db.collection('expenses').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }
    await docRef.delete();
    return { id };
  } else {
    const index = inMemoryExpenses.findIndex(e => e.id === id);
    if (index === -1) {
      throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
    }
    inMemoryExpenses.splice(index, 1);
    return { id };
  }
}

/**
 * Get expense summary/stats
 */
async function getExpenseSummary(filters = {}) {
  const expenses = await getExpenses(filters);

  if (expenses.length === 0) {
    return {
      totalExpenses: 0,
      totalAmount: 0,
      averageAmount: 0,
      categoryBreakdown: {},
      topCategory: null,
    };
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categoryBreakdown = {};
  expenses.forEach(e => {
    if (!categoryBreakdown[e.category]) {
      categoryBreakdown[e.category] = { count: 0, total: 0 };
    }
    categoryBreakdown[e.category].count++;
    categoryBreakdown[e.category].total += e.amount;
  });

  const topCategory = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b.total - a.total)[0][0];

  return {
    totalExpenses: expenses.length,
    totalAmount: Math.round(totalAmount * 100) / 100,
    averageAmount: Math.round((totalAmount / expenses.length) * 100) / 100,
    categoryBreakdown,
    topCategory,
  };
}

module.exports = { createExpense, updateExpense, getExpenses, deleteExpense, getExpenseSummary };
