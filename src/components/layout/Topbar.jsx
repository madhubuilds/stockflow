import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuthStore } from "../../store/useAuthStore";
import { canAccessModule } from "../../config/permissions";

const pageNames = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/products": "Products",
  "/inventory": "Inventory",
  "/stores": "Stores",
  "/dispatch": "Dispatch",
  "/users": "Users & Access",
  "/settings": "Settings",
};

export default function Topbar({ onMenuClick, mobileMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const currentPath = location.pathname;

  const currentPage =
    pageNames[currentPath] ||
    (currentPath.startsWith("/orders/") ? "Order Details" : "StockFlow");

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const handleSettings = () => {
    setProfileOpen(false);
    navigate("/settings");
  };

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left section */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
              {currentPage}
            </h2>

            <span className="hidden rounded-md bg-orange-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-orange-600 sm:inline-flex">
              Demo
            </span>
          </div>

          <p className="hidden text-xs text-slate-400 sm:block">
            Manage your wholesale operations
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <button
          className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-orange-500" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
            aria-expanded={profileOpen}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
              {initials}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-[130px] truncate text-xs font-bold text-slate-800">
                {user?.name || "User"}
              </p>

              <p className="text-[10px] text-slate-400">
                {user?.role || "Guest"}
              </p>
            </div>

            <ChevronDown size={15} className="hidden text-slate-400 sm:block" />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <>
              {/* Outside click layer */}
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />

              <div className="absolute right-0 top-14 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                {/* User details */}
                <div className="border-b border-slate-100 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {user?.name}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <span className="mt-3 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                    {user?.role}
                  </span>
                </div>

                {/* Settings - only when permitted */}
                {canAccessModule(user?.role, "settings") && (
                  <button
                    onClick={handleSettings}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={17} />
                    Settings
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
