
import React, { useMemo } from "react";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Leaf,
} from "lucide-react";

function Wallet({ transactions = [], onBack }) {
  const totals = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.type === "income") {
          result.income += amount;
        } else if (transaction.type === "expense") {
          result.expenses += amount;
        }

        return result;
      },
      { income: 0, expenses: 0 }
    );
  }, [transactions]);

  const balance = totals.income - totals.expenses;

  const formatCurrency = (value) =>
    `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const paymentIcons = {
    UPI: Smartphone,
    Cash: Banknote,
    Card: CreditCard,
    "Bank Transfer": Building2,
    Other: WalletIcon,
  };

  const paymentSummary = useMemo(() => {
    const methods = {};

    transactions.forEach((transaction) => {
      const method = transaction.paymentMethod || "Other";

      if (!methods[method]) {
        methods[method] = { income: 0, expenses: 0 };
      }

      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        methods[method].income += amount;
      } else if (transaction.type === "expense") {
        methods[method].expenses += amount;
      }
    });

    return Object.entries(methods).map(([method, values]) => ({
      method,
      ...values,
    }));
  }, [transactions]);

  const recentTransactions = [...transactions]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 text-[#26372D] md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-9">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-[#788078] transition hover:text-[#244B38]"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#788078]">
                Financial Overview
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[#183729] md:text-4xl">
                My Wallet
              </h1>

              <p className="mt-2 text-sm text-[#788078]">
                Your money, organized in one place.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8DDC8] text-[#244B38]">
              <WalletIcon size={27} strokeWidth={1.6} />
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <section className="relative mb-8 overflow-hidden rounded-3xl bg-[#244B38] p-7 text-[#F7F3EA] shadow-xl shadow-[#244B38]/10 md:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-10 h-48 w-48 rounded-full border border-white/10" />

          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <WalletIcon size={25} />
              </div>

              <div>
                <p className="text-sm text-[#D5DDCF]">
                  Available Balance
                </p>
                <p className="mt-1 text-xs text-[#A3B18A]">
                  Your current financial position
                </p>
              </div>
            </div>

            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#D5DDCF]">
              Total Balance
            </p>

            <h2
            className="mt-3 break-words text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ color: "#E8DDC8" }}
            >
              {formatCurrency(balance)}
              </h2>

            <div className="mt-8 flex items-center gap-2 text-sm text-[#D5DDCF]">
              <Leaf size={16} className="text-[#A3B18A]" />
              <span>
                Total income minus total recorded expenses
              </span>
            </div>
          </div>
        </section>

        {/* Income and Expense Summary */}
        <section className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E8E2D7] bg-[#FFFEFA] p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#788078]">
                  Total Income
                </p>

                <h3 className="mt-3 break-words text-2xl font-semibold text-[#244B38]">
                  {formatCurrency(totals.income)}
                </h3>
              </div>

              <div className="rounded-xl bg-[#E5EBDD] p-3 text-[#477A58]">
                <TrendingUp size={23} />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-[#477A58]">
              <ArrowUpRight size={15} />
              Money received
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8E2D7] bg-[#FFFEFA] p-6 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#788078]">
                  Total Expenses
                </p>

                <h3 className="mt-3 break-words text-2xl font-semibold text-[#B85C50]">
                  {formatCurrency(totals.expenses)}
                </h3>
              </div>

              <div className="rounded-xl bg-[#F5E8E2] p-3 text-[#B85C50]">
                <TrendingDown size={23} />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-[#B85C50]">
              <ArrowDownRight size={15} />
              Money spent
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="mb-8 rounded-2xl border border-[#E8E2D7] bg-[#FFFEFA] p-6 shadow-sm md:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788078]">
              Spending Channels
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#183729]">
              Payment Methods
            </h2>

            <p className="mt-1 text-sm text-[#788078]">
              Your financial activity grouped by payment method.
            </p>
          </div>

          {paymentSummary.length === 0 ? (
            <div className="rounded-xl bg-[#F7F3EA] py-12 text-center">
              <WalletIcon size={30} className="mx-auto mb-3 text-[#A3B18A]" />
              <p className="text-sm text-[#788078]">
                No payment activity recorded yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paymentSummary.map((item) => {
                const Icon =
                  paymentIcons[item.method] || WalletIcon;

                return (
                  <div
                    key={item.method}
                    className="rounded-xl border border-[#E8E2D7] bg-[#FDFBF6] p-5 transition hover:border-[#A3B18A] hover:shadow-sm"
                  >
                    <div className="mb-6 flex items-center gap-3">
                      <div className="rounded-xl bg-[#E8DDC8] p-3 text-[#244B38]">
                        <Icon size={21} strokeWidth={1.7} />
                      </div>

                      <h3 className="font-semibold text-[#244B38]">
                        {item.method}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#788078]">
                        Income
                      </p>
                      <p className="text-sm font-semibold text-[#477A58]">
                        {formatCurrency(item.income)}
                      </p>
                    </div>

                    <div className="my-3 border-t border-[#E8E2D7]" />

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#788078]">
                        Expenses
                      </p>
                      <p className="text-sm font-semibold text-[#B85C50]">
                        {formatCurrency(item.expenses)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="rounded-2xl border border-[#E8E2D7] bg-[#FFFEFA] p-6 shadow-sm md:p-8">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#788078]">
                Latest Records
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#183729]">
                Recent Wallet Activity
              </h2>

              <p className="mt-1 text-sm text-[#788078]">
                Your latest five financial transactions.
              </p>
            </div>

            <div className="rounded-xl bg-[#E8DDC8] p-3 text-[#244B38]">
              <CreditCard size={21} />
            </div>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="rounded-xl bg-[#F7F3EA] py-12 text-center">
              <WalletIcon size={30} className="mx-auto mb-3 text-[#A3B18A]" />
              <p className="text-sm text-[#788078]">
                No transactions available.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((transaction) => {
                const isIncome = transaction.type === "income";

                return (
                  <div
                    key={transaction._id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-b border-[#E8E2D7] px-3 py-5 last:border-0 hover:bg-[#F7F3EA]/70"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`rounded-xl p-3 ${
                          isIncome
                            ? "bg-[#E5EBDD] text-[#477A58]"
                            : "bg-[#F5E8E2] text-[#B85C50]"
                        }`}
                      >
                        {isIncome ? (
                          <TrendingUp size={20} />
                        ) : (
                          <TrendingDown size={20} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#26372D]">
                          {transaction.title}
                        </p>

                        <p className="mt-1 text-xs text-[#788078]">
                          {transaction.category} ·{" "}
                          {transaction.paymentMethod || "Other"} ·{" "}
                          {new Date(transaction.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <p
                      className={`whitespace-nowrap text-sm font-semibold ${
                        isIncome ? "text-[#477A58]" : "text-[#B85C50]"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(Number(transaction.amount) || 0)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-8 pb-4 text-center text-xs text-[#788078]">
          FinTrack · Your personal finance space
        </footer>
      </div>
    </div>
  );
}

export default Wallet;
