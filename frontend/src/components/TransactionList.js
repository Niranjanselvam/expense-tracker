import React from 'react';
import '../styles/TransactionList.css';

function TransactionList({ transactions, onEdit, onDelete }) {
  return (
    <div className="transaction-list">
      <h3>Transactions</h3>
      {transactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <tr key={transaction.id} className={transaction.type}>
                <td>{transaction.date}</td>
                <td>{transaction.type}</td>
                <td>{transaction.category}</td>
                <td className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </td>
                <td>{transaction.description || '-'}</td>
                <td className="actions">
                  <button onClick={() => onEdit(transaction)} className="btn-edit">Edit</button>
                  <button onClick={() => onDelete(transaction.id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TransactionList;
