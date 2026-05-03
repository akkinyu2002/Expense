const express = require('express');
const router = express.Router();
const {
  createExpense,
  updateExpense,
  getExpenses,
  deleteExpense,
  getExpenseSummary,
} = require('../controllers/expenseController');
const { categorize, getCategories } = require('../services/categorizationService');
const { generateInsights } = require('../services/insightsService');

const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidAmount = (amount) => amount !== undefined
  && !isNaN(parseFloat(amount))
  && parseFloat(amount) > 0;

/**
 * POST /expenses
 * Create a new expense
 */
router.post('/', async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    // Validation
    if (!isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Amount is required and must be a positive number' },
      });
    }

    if (date && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Date must be in YYYY-MM-DD format' },
      });
    }

    if (category && !getCategories().includes(category)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Category is not supported' },
      });
    }

    // Auto-categorize if no category provided
    const finalCategory = category || categorize(description);

    const expense = await createExpense({
      amount,
      category: finalCategory,
      description: description || '',
      date,
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: `Expense added${!category ? ` (auto-categorized as ${finalCategory})` : ''}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /expenses
 * List all expenses with optional filters
 * Query params: category, startDate, endDate, search, limit
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: req.query.limit,
    };

    const expenses = await getExpenses(filters);

    res.status(200).json({
      success: true,
      data: expenses,
      count: expenses.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /expenses/summary
 * Get expense summary/stats
 */
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getExpenseSummary({
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
    });
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /expenses/insights
 * Get spending insights
 */
router.get('/insights', async (req, res, next) => {
  try {
    const expenses = await getExpenses();
    const insights = generateInsights(expenses);
    res.status(200).json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /expenses/categories
 * Get list of valid categories
 */
router.get('/categories', (req, res) => {
  res.status(200).json({
    success: true,
    data: getCategories(),
  });
});

/**
 * PATCH /expenses/:id
 * Update an existing expense
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    if (amount !== undefined && !isValidAmount(amount)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Amount must be a positive number' },
      });
    }

    if (date !== undefined && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Date must be in YYYY-MM-DD format' },
      });
    }

    if (category !== undefined && !getCategories().includes(category)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Category is not supported' },
      });
    }

    const expense = await updateExpense(req.params.id, {
      amount,
      category,
      description,
      date,
    });

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /expenses/:id
 * Delete an expense
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteExpense(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
