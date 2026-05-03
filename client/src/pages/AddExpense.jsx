import ExpenseForm from '../components/ExpenseForm';

const AddExpense = () => {
  const handleSuccess = () => {
    // Optionally redirect to dashboard after adding
    // navigate('/');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold app-text">Add expense</h1>
        <p className="mt-1 app-muted">Record a transaction with the details needed for reporting.</p>
      </header>

      <div className="app-surface rounded-lg p-5 md:p-6">
        <ExpenseForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default AddExpense;
