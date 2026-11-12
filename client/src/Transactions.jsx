
import { useState } from "react";

import {
  Plus,
  Search,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
  Wallet,
} from "lucide-react";

import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "./services/transactionService";

const categories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
];

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const emptyForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: getToday(),
  paymentMethod: "UPI",
  note: "",
};

function Transactions({
  transactions,
  onTransactionsChange,
  onBack,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Open add transaction popup
  const openAddModal = (type) => {
    setEditingId(null);

    setFormData({
      ...emptyForm,
      type,
      category: type === "income" ? "Salary" : "Food",
      date: getToday(),
    });

    setError("");
    setShowModal(true);
  };

  // Open edit transaction popup
  const openEditModal = (transaction) => {
    setEditingId(transaction._id);

    setFormData({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date
        ? new Date(transaction.date).toISOString().slice(0, 10)
        : getToday(),
      paymentMethod: transaction.paymentMethod || "Other",
      note: transaction.note || "",
    });

    setError("");
    setShowModal(true);
  };

  // Handle form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Save transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a transaction title.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const transactionData = {
        ...formData,
        title: formData.title.trim(),
        amount: Number(formData.amount),
      };

      if (editingId) {
        const updated = await updateTransaction(
          editingId,
          transactionData
        );

        onTransactionsChange(
          transactions.map((item) =>
            item._id === editingId ? updated : item
          )
        );
      } else {
        const created = await addTransaction(transactionData);

        onTransactionsChange([created, ...transactions]);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Transaction save error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to save transaction. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      await deleteTransaction(id);

      onTransactionsChange(
        transactions.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error("Transaction delete error:", err);

      alert(
        err.response?.data?.message ||
        "Unable to delete transaction."
      );
    }
  };

  // Search and filter
  const filteredTransactions = transactions.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" || item.type === filter;

    return matchesSearch && matchesFilter;
  });

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalExpenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="min-h-screen">

      {/* PAGE HEADER */}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

        <div>
          <button
            onClick={onBack}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <h2 className="text-2xl font-bold text-slate-800">
            Transaction Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your income and expenses.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            onClick={() => openAddModal("income")}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Income
          </button>

          <button
            onClick={() => openAddModal("expense")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Expense
          </button>

        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="mb-8 grid gap-5 md:grid-cols-2">

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Income
          </p>

          <h3 className="mt-3 text-2xl font-bold text-emerald-600">
            ₹{totalIncome.toLocaleString("en-IN")}
          </h3>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Expenses
          </p>

          <h3 className="mt-3 text-2xl font-bold text-rose-600">
            ₹{totalExpenses.toLocaleString("en-IN")}
          </h3>
        </div>

      </div>

      {/* TRANSACTION TABLE */}

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>
            <h3 className="text-lg font-bold">
              All Transactions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {filteredTransactions.length} transactions found
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 sm:w-56"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>

          </div>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-4 font-medium">Transaction</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Type</th>
                <th className="pb-4 text-right font-medium">Amount</th>
                <th className="pb-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredTransactions.length > 0 ? (
                [...filteredTransactions]
                  .sort(
                    (a, b) =>
                      new Date(b.date) - new Date(a.date)
                  )
                  .map((item) => (

                    <tr
                      key={item._id}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >

                      <td className="py-5 font-semibold">
                        {item.title}
                      </td>

                      <td className="py-5 text-slate-500">
                        {item.category}
                      </td>

                      <td className="py-5 text-slate-500">
                        {new Date(item.date).toLocaleDateString("en-IN")}
                      </td>

                      <td className="py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.type === "income"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td
                        className={`py-5 text-right font-bold ${
                          item.type === "income"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {item.type === "income" ? "+" : "-"}₹
                        {Number(item.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="py-5">
                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() => openEditModal(item)}
                            title="Edit transaction"
                            className="rounded-lg bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(item._id)}
                            title="Delete transaction"
                            className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </td>

                    </tr>

                  ))
              ) : (

                <tr>
                  <td
                    colSpan="6"
                    className="py-12 text-center text-slate-400"
                  >
                    <Wallet size={35} className="mx-auto mb-3 opacity-40" />
                    No transactions found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ADD / EDIT POPUP MODAL */}

      {showModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setShowModal(false);
            }
          }}
        >

          <div className="my-auto w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingId ? "Edit Transaction" : "Add Transaction"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter your transaction details below.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>

            </div>

            {/* TRANSACTION FORM */}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* TYPE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Transaction Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* TITLE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Transaction Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Example: Monthly Salary"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* AMOUNT */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Amount (₹)
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* PAYMENT METHOD */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* NOTE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Note (Optional)
                </label>

                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Add additional details..."
                  rows="3"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                />
              </div>

              {/* ERROR */}

              {error && (
                <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
                  {error}
                </p>
              )}

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Transaction"
                    : "Save Transaction"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Transactions;
