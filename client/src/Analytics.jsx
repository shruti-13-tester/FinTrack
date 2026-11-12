
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Wallet } from "lucide-react";

function Analytics({ transactions = [], onBack }) {
  const monthlyData = useMemo(() => {
    const months = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!months[key]) {
        months[key] = {
          month: date.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
          income: 0,
          expense: 0,
          sortDate: date.getTime(),
        };
      }

      if (transaction.type === "income") {
        months[key].income += Number(transaction.amount);
      } else if (transaction.type === "expense") {
        months[key].expense += Number(transaction.amount);
      }
    });

    return Object.values(months)
      .sort((a, b) => a.sortDate - b.sortDate)
      .slice(-6);
  }, [transactions]);

  const expenseData = useMemo(() => {
    const categories = {};

    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;

      const category = transaction.category || "Other";
      categories[category] =
        (categories[category] || 0) + Number(transaction.amount);
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const savings = income - expenses;

  const COLORS = [
    "#6366f1",
    "#14b8a6",
    "#f59e0b",
    "#ec4899",
    "#8b5cf6",
    "#06b6d4",
    "#f97316",
  ];

  const formatCurrency = (value) =>
    `₹${Number(value).toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={onBack}
              className="mb-3 flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Financial Analytics
            </h1>
            <p className="mt-1 text-slate-500">
              Understand your income, expenses and savings.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Income</span>
              <TrendingUp className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {formatCurrency(income)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Expenses</span>
              <TrendingDown className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {formatCurrency(expenses)}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-500">Net Savings</span>
              <Wallet className="text-indigo-500" />
            </div>
            <h2
              className={`text-2xl font-bold ${
                savings >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(savings)}
            </h2>
          </div>
        </div>

        {/* Monthly Income vs Expenses */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-slate-900">
            Monthly Income vs Expenses
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            Comparison of your income and spending by month.
          </p>

          {monthlyData.length === 0 ? (
            <p className="py-16 text-center text-slate-500">
              Add transactions to see your monthly analytics.
            </p>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expenses"
                    fill="#f43f5e"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expense Category Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-slate-900">
            Expense Breakdown
          </h2>
          <p className="mb-6 text-sm text-slate-500">
            See where your money is going.
          </p>

          {expenseData.length === 0 ? (
            <p className="py-16 text-center text-slate-500">
              Add expense transactions to see your category breakdown.
            </p>
          ) : (
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {expenseData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {expenseData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm text-slate-600">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
