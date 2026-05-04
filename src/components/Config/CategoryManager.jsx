import React from 'react';
import Card, { CardBody, CardHeader } from '../Common/Card';
import Input from '../Common/Input';
import Button from '../Common/Button';
import './CategoryManager.css';

export default function CategoryManager({
  incomeCategories = [],
  expenseCategories = [],
  onAddCategory,
  onDeleteCategory,
  loading = false
}) {
  const [newIncome, setNewIncome] = React.useState('');
  const [newExpense, setNewExpense] = React.useState('');

  const handleAddIncome = () => {
    if (newIncome.trim()) {
      onAddCategory(newIncome, 'income');
      setNewIncome('');
    }
  };

  const handleAddExpense = () => {
    if (newExpense.trim()) {
      onAddCategory(newExpense, 'expense');
      setNewExpense('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3>Categories</h3>
      </CardHeader>
      <CardBody>
        <div className="categories-grid">
          {/* Income Categories */}
          <div className="category-section">
            <h4>Income</h4>
            <div className="category-list">
              {incomeCategories.map(cat => (
                <div key={cat.id} className="category-item">
                  <span>{cat.name}</span>
                  <button
                    className="btn-delete"
                    onClick={() => onDeleteCategory(cat.id)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="add-category">
              <Input
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                placeholder="Add income category"
                disabled={loading}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddIncome}
                disabled={loading || !newIncome.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="category-section">
            <h4>Expenses</h4>
            <div className="category-list">
              {expenseCategories.map(cat => (
                <div key={cat.id} className="category-item">
                  <span>{cat.name}</span>
                  <button
                    className="btn-delete"
                    onClick={() => onDeleteCategory(cat.id)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="add-category">
              <Input
                value={newExpense}
                onChange={(e) => setNewExpense(e.target.value)}
                placeholder="Add expense category"
                disabled={loading}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddExpense}
                disabled={loading || !newExpense.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
