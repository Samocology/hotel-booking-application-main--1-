import React, { useState, useEffect } from "react";

export default function SaleManager() {
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ item: "", amount: "" });
  const [editingId, setEditingId] = useState(null);

  const API_URL = "http://localhost:5000/api/sales"; // Change to your backend URL

  const fetchSales = async () => {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setSales(data);
  };

  useEffect(() => {
    fetchSales();
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
      setForm({ item: "", amount: "" });
      setEditingId(null);
      fetchSales();
    } else {
      alert("Error saving sale");
    }
  };

  const handleEdit = (sale) => {
    setForm({ item: sale.item, amount: sale.amount });
    setEditingId(sale._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (res.ok) fetchSales();
    else alert("Failed to delete sale");
  };

  return (
    <div>
      <h2>Sale Management</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="item"
          placeholder="Item name"
          value={form.item}
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
        <button type="submit">{editingId ? "Update Sale" : "Add Sale"}</button>
      </form>

      <ul>
        {sales.map((sale) => (
          <li key={sale._id}>
            {sale.item} - ₦{sale.amount}{" "}
            <button onClick={() => handleEdit(sale)}>Edit</button>{" "}
            <button onClick={() => handleDelete(sale._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
