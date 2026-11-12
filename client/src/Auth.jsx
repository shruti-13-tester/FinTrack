
import { useState } from "react";
import { Wallet, Eye, EyeOff } from "lucide-react";
import API from "./services/api";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      const response = await API.post(endpoint, formData);

      localStorage.setItem("fintrack_token", response.data.token);
      localStorage.setItem(
        "fintrack_user",
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <Wallet size={28} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Fin<span className="text-indigo-600">Track</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your money. Build your future.
          </p>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-slate-800">
          {isLogin ? "Welcome back!" : "Create your account"}
        </h2>

        <p className="mb-6 text-sm text-slate-500">
          {isLogin
            ? "Sign in to access your financial dashboard."
            : "Register to start managing your finances."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({
                name: "",
                email: "",
                password: "",
              });
            }}
            className="ml-2 font-semibold text-indigo-600 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Auth;
