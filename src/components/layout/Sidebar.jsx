import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Warehouse,
  Store,
  Truck,
  Users,
  Settings,
  Boxes,
  X,
} from "lucide-react";

import { useStockFlowStore } from "../../store/useStockFlowStore";
import { useAuthStore } from "../../store/useAuthStore";
import { canAccessModule } from "../../config/permissions";

export default function Sidebar({ mobileMenuOpen, onClose }) {
  const orders = useStockFlowStore((state) => state.orders);
  const dispatches = useStockFlowStore((state) => state.dispatches);

  const user = useAuthStore((state) => state.user);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending",
  ).length;

  const dispatchCount = dispatches.length;

  const navigation = [
    {
      title: "WORKSPACE",
      items: [
        {
          name: "Dashboard",
          path: "/",
          module: "dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Orders",
          path: "/orders",
          module: "orders",
          icon: ShoppingBag,
          count: pendingOrders,
        },
        {
          name: "Products",
          path: "/products",
          module: "products",
          icon: Package,
        },
        {
          name: "Inventory",
          path: "/inventory",
          module: "inventory",
          icon: Warehouse,
        },
        {
          name: "Stores",
          path: "/stores",
          module: "stores",
          icon: Store,
        },
      ],
    },
    {
      title: "MANAGEMENT",
      items: [
        {
          name: "Dispatch",
          path: "/dispatch",
          module: "dispatch",
          icon: Truck,
          count: dispatchCount,
        },
        {
          name: "Users & Access",
          path: "/users",
          module: "users",
          icon: Users,
        },
        {
          name: "Settings",
          path: "/settings",
          module: "settings",
          icon: Settings,
        },
      ],
    },
  ];

  // Show only modules permitted for the logged-in role.
  const visibleNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessModule(user?.role, item.module),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Boxes size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                StockFlow
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Wholesale operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-7">
          {visibleNavigation.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-slate-900 text-white shadow-md"
                            : "text-slate-600 hover:bg-slate-100"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={19} />

                          <span className="flex-1">{item.name}</span>

                          {item.count > 0 && (
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                isActive
                                  ? "bg-white/15 text-white"
                                  : "bg-orange-50 text-orange-600"
                              }`}
                            >
                              {item.count}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-semibold text-slate-700">
                {user?.role || "Demo"} workspace
              </p>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400">
              Central warehouse operations.
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] font-medium text-slate-400">
            STOCKFLOW · DEMO V1.0
          </p>
        </div>
      </aside>
    </>
  );
}
