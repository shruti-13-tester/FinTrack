
import API from "./api";

// Get logged-in user's profile
export const getProfile = async () => {
  const response = await API.get("/users/profile");
  return response.data.user;
};

// Update logged-in user's profile
export const updateProfile = async (profileData) => {
  const response = await API.put(
    "/users/profile",
    profileData
  );

  return response.data;
};
