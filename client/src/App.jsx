
import { useState, useEffect } from "react";
import Transactions from "./Transactions";
import Analytics from "./Analytics";
import Wallet from "./Wallet";
import SettingsPage from "./Settings";

import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  ChartNoAxesCombined,
  Settings,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  LogOut,
  RefreshCw,
} from "lucide-react";

import Auth from "./Auth";
import { getTransactions } from "./services/transactionService";

function App() {
  // --------------------------------
  // AUTHENTICATION STATE
  // --------------------------------

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("fintrack_token");
    const savedUser = localStorage.getItem("fintrack_user");

    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem("fintrack_token");
        localStorage.removeItem("fintrack_user");
        return null;
      }
    }

    return null;
  });

  // --------------------------------
  // TRANSACTION STATE
  // --------------------------------

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activePage, setActivePage] = useState("Dashboard");

  // --------------------------------
  // LOGIN HANDLER
  // --------------------------------

  const handleLogin = (userData) => {
    setUser(userData);
    setTransactions([]);
    setLoading(true);
  };

  // --------------------------------
  // LOGOUT HANDLER
  // --------------------------------

  const handleLogout = () => {
    localStorage.removeItem("fintrack_token");
    localStorage.removeItem("fintrack_user");

    setUser(null);
    setTransactions([]);
    setError("");
    setLoading(false);
    setActivePage("Dashboard");
  };

  // --------------------------------
  // FETCH TRANSACTIONS FROM BACKEND
  // --------------------------------

  const loadTransactions = async () => {
    try {
      setError("");

      const data = await getTransactions();

      setTransactions(data);
    } catch (err) {
      console.error("Transaction loading error:", err);

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        err.response?.data?.message ||
        "Unable to load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadTransactions();
  }, [user]);

  // --------------------------------
  // CALCULATE FINANCIAL SUMMARY
  // --------------------------------

  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const balance = income - expenses;

  const savingsPercentage =
    income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  // --------------------------------
  // SIDEBAR MENU
  // --------------------------------

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Transactions", icon: ArrowLeftRight },
    { name: "My Wallet", icon: WalletCards },
    { name: "Analytics", icon: ChartNoAxesCombined },
    { name: "Settings", icon: Settings },
  ];

  // --------------------------------
  // SHOW LOGIN SCREEN
  // --------------------------------

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // --------------------------------
  // SHOW LOADING SCREEN
  // --------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>

          <p className="font-semibold text-indigo-600">
            Loading FinTrack...
          </p>
        </div>
      </div>
    );
  }

  if (activePage === "Transactions") {
  return (
    <Transactions
      transactions={transactions}
      onTransactionsChange={setTransactions}
      onBack={() => setActivePage("Dashboard")}
    />
  );
}

if (activePage === "Analytics") {
  return (
    <Analytics
      transactions={transactions}
      onBack={() => setActivePage("Dashboard")}
    />
  );
}

if (activePage === "My Wallet") {
  return (
    <Wallet
      transactions={transactions}
      onBack={() => setActivePage("Dashboard")}
    />
  );
}

if (activePage === "Settings") {
  return (
    <SettingsPage
      user={user}
      onBack={() => setActivePage("Dashboard")}
      onLogout={handleLogout}
    />
  );
}

  // --------------------------------
  // MAIN DASHBOARD
  // --------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">

      {/* SIDEBAR */}

      <aside className="w-full bg-slate-950 p-6 text-white md:min-h-screen md:w-64 md:shrink-0">

        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500 p-2">
            <WalletCards size={23} />
          </div>

          <h1
            className="text-2xl font-bold"
            style={{ color: "#E8DDC8" }}
          >
          FinTrack
          </h1>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>

        <nav className="flex gap-2 overflow-x-auto md:flex-col">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => setActivePage(item.name)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  activePage === item.name
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </button>
            );
          })}

        </nav>

        <div className="mt-12 hidden rounded-2xl bg-slate-900 p-4 md:block">
          <p className="mb-2 text-sm font-semibold">
            Manage your money
          </p>

          <p className="text-xs leading-5 text-slate-400">
            Track your income, expenses and savings with FinTrack.
          </p>
        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="min-w-0 flex-1 p-5 md:p-8">

        {/* HEADER */}

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-sm text-slate-500">
              Welcome back, {user.name}!
            </p>

            <h2 className="text-2xl font-bold">
              {activePage}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Here's what's happening with your money.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={loadTransactions}
              title="Refresh transactions"
              className="rounded-xl border border-slate-200 bg-white p-3 hover:bg-slate-100"
            >
              <RefreshCw size={19} />
            </button>

            <button className="rounded-xl border border-slate-200 bg-white p-3">
              <Bell size={19} />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100"
            >
              <LogOut size={17} />
              Logout
            </button>

          </div>

        </header>

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <p>{error}</p>

            <button
              onClick={loadTransactions}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* BALANCE CARD */}

        <section className="mb-6 rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 p-7 text-white shadow-lg"
        style={{background: "#244B38" }}
        >

          <p className="text-sm text-indigo-100">
            Total Balance
          </p>

          <h3 className="mt-3 text-4xl font-bold"
          style={{ color: "#E8DDC8" }}>
            ₹{balance.toLocaleString("en-IN")}
          </h3>

          <p className="mt-3 text-sm text-indigo-100">
            Your balance based on recorded transactions
          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              onClick={() => setActivePage("Transactions")}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700"
            >
              <Plus size={17} />
              Add Income
            </button>

            <button
              onClick={() => setActivePage("Transactions")}
              className="flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Add Expense
            </button>

          </div>

        </section>

        {/* FINANCIAL SUMMARY */}

        <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

          {/* INCOME */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total Income
              </p>

              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                <ArrowUpRight size={21} />
              </div>
            </div>

            <h3 className="mt-4 text-2xl font-bold">
              ₹{income.toLocaleString("en-IN")}
            </h3>

            <p className="mt-2 text-xs text-emerald-600">
              Money received
            </p>

          </div>

          {/* EXPENSES */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total Expenses
              </p>

              <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                <ArrowDownRight size={21} />
              </div>
            </div>

            <h3 className="mt-4 text-2xl font-bold">
              ₹{expenses.toLocaleString("en-IN")}
            </h3>

            <p className="mt-2 text-xs text-rose-600">
              Money spent
            </p>

          </div>

          {/* SAVINGS */}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:col-span-2 xl:col-span-1">

            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Net Savings
              </p>

              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <IndianRupee size={21} />
              </div>
            </div>

            <h3 className="mt-4 text-2xl font-bold">
              ₹{balance.toLocaleString("en-IN")}
            </h3>

            <p className="mt-2 text-xs text-blue-600">
              {savingsPercentage}% of total income
            </p>

          </div>

        </section>

        {/* TRANSACTION HISTORY */}

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h3 className="text-lg font-bold">
                Recent Transactions
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Your latest financial activities
              </p>
            </div>

            <button
              onClick={() => setActivePage("Transactions")}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <ArrowLeftRight size={17} />
              View All
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-4 font-medium">Transaction</th>
                  <th className="pb-4 font-medium">Category</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 text-right font-medium">Amount</th>
                </tr>
              </thead>

              <tbody>

                {transactions.length > 0 ? (
                  [...transactions]
                    .sort(
                      (a, b) =>
                        new Date(b.date) - new Date(a.date)
                    )
                    .slice(0, 10)
                    .map((item) => (

                      <tr
                        key={item._id}
                        className="border-b border-slate-50"
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

                      </tr>

                    ))
                ) : (

                  <tr>
                    <td
                      colSpan="4"
                      className="py-10 text-center text-slate-400"
                    >
                      No transactions found. Add your first transaction!
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* FOOTER */}

        <footer className="mt-8 text-center text-xs text-slate-400">
          © 2026 FinTrack. Personal Finance Management.
        </footer>

      </main>

    </div>
  );
}

export default App;
