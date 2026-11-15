import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, PackageCheck } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { demoCredentials } from "../../data/demoUsers";

export default function Login() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const requestedPath = location.state?.from?.pathname || "/";
    navigate(requestedPath, { replace: true });
  };

  const fillCredentials = (credential) => {
    setEmail(credential.email);
    setPassword(credential.password);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#f5f6fa] px-4 py-10 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-sky-700 p-10 text-white lg:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500 p-2.5">
              <PackageCheck size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">StockFlow</span>
          </div>

          <div className="max-w-md">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
              Wholesale operations, organized
            </p>
            <h1 className="text-4xl font-bold leading-tight">
              Your godown operations in one place.
            </h1>
            <p className="mt-5 leading-7 text-slate-300">
              Manage orders, inventory, stores and dispatch workflows from a
              single workspace.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-3">
              {[
                "Order management",
                "Stock visibility",
                "Store directory",
                "Dispatch tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">StockFlow · Demo workspace</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 font-bold">
                <span className="rounded-lg bg-indigo-600 p-2 text-white">
                  <PackageCheck size={20} />
                </span>
                StockFlow
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-indigo-600">
                WELCOME BACK
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Sign in to StockFlow
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your account credentials to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </span>
                <span className="relative block">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </span>
                <span className="relative block">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Demo accounts
                </p>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
                  Demo only
                </span>
              </div>
              <div className="space-y-2">
                {demoCredentials.map((credential) => (
                  <button
                    type="button"
                    key={credential.email}
                    onClick={() => fillCredentials(credential)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <span className="text-xs font-medium text-slate-700">
                      {credential.role}
                    </span>
                    <span className="text-xs text-indigo-600">
                      Use demo login
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Demo credentials are bundled in the frontend. Do not use real
              passwords or deploy this authentication method publicly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
