import React, { useState, useEffect } from "react";

export default function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "" });
  const [editingId, setEditingId] = useState(null);

  const API_URL = "http://localhost:5000/api/expenses"; // Change to your backend URL

  const fetchExpenses = async () => {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL + "/create";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setForm({ description: "", amount: "" });
      setEditingId(null);
      fetchExpenses();
    } else {
      alert("Error saving expense");
    }
  };

  const handleEdit = (expense) => {
    setForm({ description: expense.description, amount: expense.amount });
    setEditingId(expense._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.ok) fetchExpenses();
    else alert("Failed to delete expense");
  };

  return (
    <div>
      <h2>Expense Management</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingId ? "Update Expense" : "Add Expense"}</button>
      </form>

      <ul>
        {expenses.map((expense) => (
          <li key={expense._id}>
            {expense.description} - ₦{expense.amount}{" "}
            <button onClick={() => handleEdit(expense)}>Edit</button>{" "}
            <button onClick={() => handleDelete(expense._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
