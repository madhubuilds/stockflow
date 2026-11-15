import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  Store,
  Truck,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  Boxes,
  LogOut,
  UserRound,
  PanelLeftClose,
} from "lucide-react";

const navigation = [
  {
    title: "WORKSPACE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard },
      { name: "Orders", icon: ShoppingBag, count: 12 },
      { name: "Products", icon: Package },
      { name: "Inventory", icon: Warehouse },
      { name: "Stores", icon: Store },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      { name: "Dispatch", icon: Truck },
      { name: "Users & Access", icon: Users },
      { name: "Settings", icon: Settings },
    ],
  },
];

export default function Navbar({ activePage = "Dashboard", onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigate = (page) => {
    onNavigate?.(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Boxes size={22} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                StockFlow
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Wholesale operations
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-7">
          {navigation.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.name;

                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.name)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all ${
                        active
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : 1.8}
                        className={
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700"
                        }
                      />

                      <span className="flex-1">{item.name}</span>

                      {item.count && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}

                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-slate-700">
                Warehouse connected
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Central warehouse management workspace.
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
            STOCKFLOW · DEMO VERSION 1.0
          </p>
        </div>
      </aside>

      {/* Main application area */}
      <div className="min-h-screen bg-[#F7F8FA] lg:pl-[280px]">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                  {activePage}
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

          {/* Right */}
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
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
                  M
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold text-slate-800">Manager</p>
                  <p className="text-[10px] text-slate-400">
                    Central Warehouse
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="hidden text-slate-400 sm:block"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <UserRound size={17} />
                    My profile
                  </button>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Settings size={17} />
                    Preferences
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content goes here */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Render your page components here */}
        </main>
      </div>
    </>
  );
}
