import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export default function Unauthorized() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert size={28} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Access restricted</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your current role{user?.role ? ` (${user.role})` : ""} does not have permission to open this section.
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
