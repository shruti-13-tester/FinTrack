import User from "../models/User.js";

// Get logged-in user's profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve profile",
      error: error.message,
    });
  }
};

// Update logged-in user's profile
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      profilePhoto,
    } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = phone?.trim() || "";
    user.dateOfBirth = dateOfBirth || null;
    user.gender = gender || "";
    user.address = address?.trim() || "";
    user.profilePhoto = profilePhoto || "";

    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "Personal information updated successfully",
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update personal information",
      error: error.message,
    });
  }
};