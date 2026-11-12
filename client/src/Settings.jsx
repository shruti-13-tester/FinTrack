
import React, { useEffect, useState } from "react";
import {
  ArrowLeft, User, Camera, Mail, Phone, Calendar,
  MapPin, Save, LogOut, Loader2, ShieldCheck,
  Bell, Globe, Lock, ChevronRight
} from "lucide-react";

import { getProfile, updateProfile } from "./services/userService";

function Settings({ user, onBack, onLogout }) {
  const [activeSection, setActiveSection] = useState("Personal Information");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    profilePhoto: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().split("T")[0]
            : "",
          gender: data.gender || "",
          address: data.address || "",
          profilePhoto: data.profilePhoto || "",
        });
      } catch (err) {
        setError("Could not load your personal information.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Photo must be smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: reader.result,
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateProfile(formData);
      const updatedUser = response.user;

      localStorage.setItem(
        "fintrack_user",
        JSON.stringify(updatedUser)
      );

      setSuccess("Personal information updated successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update your information."
      );
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { name: "Personal Information", icon: User },
    { name: "Account Security", icon: ShieldCheck },
    { name: "Preferences", icon: Bell },
    { name: "Currency Settings", icon: Globe },
  ];

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const renderPersonalInformation = () => (
    <form onSubmit={handleSave}>
      <div className="mb-8 flex flex-col items-center border-b border-slate-100 pb-8">
        <div className="relative">
          {formData.profilePhoto ? (
            <img
              src={formData.profilePhoto}
              alt="Profile"
              className="h-28 w-28 rounded-full border-4 border-indigo-100 object-cover"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <User size={48} />
            </div>
          )}

          <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow">
            <Camera size={17} />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
        <p className="mt-3 text-sm font-semibold">Profile Photo</p>
        <p className="text-xs text-slate-400">JPG or PNG, maximum 2 MB</p>
      </div>

      <h3 className="mb-5 text-lg font-semibold">Basic Information</h3>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-8">
        <h3 className="mb-5 text-lg font-semibold">Address Information</h3>
        <label className="mb-2 block text-sm font-medium">Residential Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={4}
          placeholder="Enter your complete address"
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="animate-spin" size={17} /> : <Save size={17} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );

  const renderOtherSection = () => {
    const sections = {
      "Account Security": {
        icon: Lock,
        description: "Manage your account protection and security.",
        items: ["Change Password", "Login Security", "Account Protection"],
      },
      Preferences: {
        icon: Bell,
        description: "Customize your FinTrack experience.",
        items: ["Email Notifications", "Budget Alerts", "Monthly Financial Summary"],
      },
      "Currency Settings": {
        icon: Globe,
        description: "Choose how financial amounts appear in FinTrack.",
        items: ["Display Currency", "Number Format"],
      },
    };

    const section = sections[activeSection];
    const SectionIcon = section.icon;

    return (
      <div>
        <div className="mb-7 flex items-center gap-4 rounded-2xl bg-indigo-50 p-5">
          <div className="rounded-xl bg-white p-3 text-indigo-600">
            <SectionIcon size={25} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{activeSection}</h3>
            <p className="mt-1 text-sm text-slate-500">{section.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          {section.items.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <span className="text-sm font-medium text-slate-700">{item}</span>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          ))}
        </div>

        {activeSection === "Currency Settings" && (
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">Display Currency</label>
            <select
              className={inputClass}
              defaultValue="INR"
              onChange={() => {}}
            >
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
            </select>
            <p className="mt-2 text-xs text-slate-400">
              Currency selection is currently a visual setting; persistence will be added separately.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your account and application preferences.
          </p>
        </div>

<div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_minmax(0,1fr)]">          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 border-b border-slate-100 px-3 pb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account Settings
              </p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const selected = activeSection === item.name;

                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => {
                      setActiveSection(item.name);
                      setError("");
                      setSuccess("");
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      selected
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={19} />
                    {item.name}
                    {selected && <ChevronRight className="ml-auto" size={17} />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={19} />
                Logout
              </button>
            </div>
          </aside>

          <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            <div className="mb-7 border-b border-slate-100 pb-5">
              <h2 className="text-xl font-bold text-slate-900">{activeSection}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Update and manage your {activeSection.toLowerCase()}.
              </p>
            </div>

            {activeSection === "Personal Information"
              ? renderPersonalInformation()
              : renderOtherSection()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Settings;
