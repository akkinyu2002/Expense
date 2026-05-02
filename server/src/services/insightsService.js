/**
 * Insights Service
 *
 * Analyzes expense data and generates human-readable spending insights.
 */

/**
 * Generate spending insights from an array of expenses
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} - Array of insight objects
 */
function generateInsights(expenses) {
  if (!expenses || expenses.length === 0) {
    return [{ type: 'info', title: 'No Data', message: 'Start adding expenses to see spending insights!' }];
  }

  const insights = [];

  // 1. Total spending
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  insights.push({
    type: 'stat',
    title: 'Total Spending',
    message: `You've spent a total of Rs. ${totalAmount.toLocaleString()} across ${expenses.length} expenses.`,
    value: totalAmount,
  });

  // 2. Category breakdown
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  if (sortedCategories.length > 0) {
    const [topCat, topAmt] = sortedCategories[0];
    const percentage = Math.round((topAmt / totalAmount) * 100);
    insights.push({
      type: 'warning',
      title: 'Top Spending Category',
      message: `${topCat} is your highest spending category at Rs. ${topAmt.toLocaleString()} (${percentage}% of total).`,
      value: topAmt,
      category: topCat,
    });
  }

  // 3. Daily average
  const dates = [...new Set(expenses.map(e => e.date))];
  const dailyAvg = Math.round(totalAmount / dates.length);
  insights.push({
    type: 'stat',
    title: 'Daily Average',
    message: `Your average daily spending is Rs. ${dailyAvg.toLocaleString()} over ${dates.length} day(s).`,
    value: dailyAvg,
  });

  // 4. Largest single expense
  const largest = expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0]);
  insights.push({
    type: 'info',
    title: 'Biggest Expense',
    message: `Your largest single expense was Rs. ${largest.amount.toLocaleString()} for "${largest.description}" (${largest.category}).`,
    value: largest.amount,
  });

  // 5. Spending trend (if enough data)
  if (dates.length >= 3) {
    const sortedDates = dates.sort();
    const recentDates = sortedDates.slice(-3);
    const olderDates = sortedDates.slice(0, Math.max(1, sortedDates.length - 3));

    const recentTotal = expenses
      .filter(e => recentDates.includes(e.date))
      .reduce((sum, e) => sum + e.amount, 0);
    const olderTotal = expenses
      .filter(e => olderDates.includes(e.date))
      .reduce((sum, e) => sum + e.amount, 0);

    const recentAvg = recentTotal / recentDates.length;
    const olderAvg = olderTotal / olderDates.length;

    if (recentAvg > olderAvg * 1.2) {
      insights.push({
        type: 'warning',
        title: 'Spending Trend ↑',
        message: `Your recent spending is trending upward — ${Math.round(((recentAvg - olderAvg) / olderAvg) * 100)}% higher than earlier.`,
      });
    } else if (recentAvg < olderAvg * 0.8) {
      insights.push({
        type: 'success',
        title: 'Spending Trend ↓',
        message: `Great job! Your recent spending is ${Math.round(((olderAvg - recentAvg) / olderAvg) * 100)}% lower than earlier.`,
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Spending Trend →',
        message: 'Your spending has been relatively stable recently.',
      });
    }
  }

  // 6. Category with fewest expenses
  if (sortedCategories.length > 1) {
    const [lowCat, lowAmt] = sortedCategories[sortedCategories.length - 1];
    insights.push({
      type: 'success',
      title: 'Least Spent On',
      message: `${lowCat} is your lowest spending category at Rs. ${lowAmt.toLocaleString()}.`,
      value: lowAmt,
      category: lowCat,
    });
  }

  return insights;
}

module.exports = { generateInsights };
