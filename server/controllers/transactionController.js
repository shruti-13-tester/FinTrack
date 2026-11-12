
import Transaction from "../models/Transaction.js";

// ADD TRANSACTION
export const addTransaction = async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      note,
    } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        message: "Please provide all required transaction details",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Transaction type must be income or expense",
      });
    }

    const transaction = await Transaction.create({
      user: req.user,
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      note,
    });

    res.status(201).json({
      message: "Transaction added successfully!",
      transaction,
    });
  } catch (error) {
    console.error("Add transaction error:", error.message);

    res.status(500).json({
      message: "Failed to add transaction",
    });
  }
};

// GET ALL USER TRANSACTIONS
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user,
    }).sort({ date: -1 });

    res.status(200).json({
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error.message);

    res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
};

// UPDATE TRANSACTION
export const updateTransaction = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "amount",
      "type",
      "category",
      "date",
      "paymentMethod",
      "note",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.amount !== undefined &&
        (!Number.isFinite(Number(updates.amount)) ||
         Number(updates.amount) <= 0)) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    if (updates.type !== undefined &&
        !["income", "expense"].includes(updates.type)) {
      return res.status(400).json({
        message: "Invalid transaction type",
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction updated successfully!",
      transaction,
    });
  } catch (error) {
    console.error("Update transaction error:", error.message);

    res.status(500).json({
      message: "Failed to update transaction",
    });
  }
};

// DELETE TRANSACTION
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully!",
    });
  } catch (error) {
    console.error("Delete transaction error:", error.message);

    res.status(500).json({
      message: "Failed to delete transaction",
    });
  }
};
